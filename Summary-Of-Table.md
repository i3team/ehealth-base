# Quy trình get, render, xử lý data đối với table
## 1. Get PageModel (thường sử dụng đối với các trang mà đối tượng chính là bảng)
a) Viết API get PageModel chứa thông tin:

- SearchModel mặc định (object từ class kế thừa từ BaseTableFilterModel)
```cshaph
 public class BaseTableFilterModel : Pagination 
    {
        public SortDirection SortDirection { get; set; }
        public string OrderBy { get; set; }
        public List<string> GroupByColumns { get; set; }
        public List<string> ShowingColumns { get; set; }
        public BaseTableFilterModel()
        {
            GroupByColumns = new List<string>();
            ShowingColumns = new List<string>();
            SortDirection = SortDirection.Ascending;
        }
    }
```
- Dữ liệu cho các Dropdown phục vụ cho filter component
- Dữ liệu trống của table
- ... v.v...

b) Gọi ajax đến api phía trên ở component Page

## 2. Viết api lấy dữ liệu cho bảng
### a) Parameter đầu vô của controller là searchModel
### b) Controller gọi lên ServiceHost, truyền searchModel lên. Để viết hàm trên ServiceHost thì cần làm các bước sau:
- Tạo ModelRaw (viết trong project EHealth.ViewModel/Table) chứa tất cả các trường mà table cần, cần gắn attribule [Table] cho class
- Tạo StatisticFigure cho class này (viết trong EHealth.ServiceHost/StatisticFigure): một số trường sẽ được group lấy SUM, MIN, MAX, AVERAGE tùy thuộc vào sự ẩn hiện của các trường khác (ví dụ số lượng thuốc,...)
- Tạo ```IQueryable<ModelRaw>```, đảm bảo tất cả các trường select lên phải là value type
```cshaph
var query = (from consumable in context.Consumables
                         join parentConsumable in context.Consumables on consumable.ParentId equals parentConsumable.Id into p1
                         from parentConsumable in p1.DefaultIfEmpty()

                         join medication in context.Medications on consumable.Id equals medication.ConsumableId into m
                         from medication in m.DefaultIfEmpty()

                         join hoatChat in context.HoatChats on medication.HoatChatId equals hoatChat.Id into h
                         from hoatChat in h.DefaultIfEmpty()

                         join manufactor in context.Manufactors on consumable.ManufactorId equals manufactor.Id

                         select new ConsumableRaw()
                         {
                             GroupId = consumable.ParentId,
                             GroupName = parentConsumable.Name,
                             Id = consumable.Id,
                             Code = consumable.Code,
                             Name = consumable.Name,
                             HoatChatId = hoatChat.Id,
                             TenHoatChat = "Hoạt chất ABC",
                             HamLuong = medication.HamLuong,
                             Min = 0,
                             Max = 100,
                             UsageUnitName = "viên",
                             UsageQuantity = 20,
                             UnitId = 0,
                             UnitName = "hộp",
                             Quantity = 10,
                             ManufactorId = consumable.ManufactorId,
                             ManufactorName = manufactor.Name,
                             Cost = 1000,
                             BatchId = guid,
                             BatchNumber = "",
                             Date = date,
                             WareHouseId = 0,
                             WareHouseName = "",
                             HospitalId = 0,
                             HospitalName = ""
                         });
```
- Đưa query này vào hàm DynamicGroup để tiến hành sort, phân trang, group dữ liệu trên raw data,...
```cshaph
var data = await query.DynamicGroup(searchModel);
```
- Xử lý thêm data này (nếu cần) và trả về controller;

### c) Controller nhận ```List<ModelRaw>``` từ ServiceHost, tiến hành group dữ liệu theo header
```cshaph
result.Data.DataList.GroupActionHeader(searchModel.GroupByColumns, searchModel.ShowingColumns, ETableDataType.Consumable, i => i.BatchList)
```

Parameters của hàm GroupActionHeader
Name | Type | Description
:--- | :--- | :---
`dataList` | List<T> | List data raw
`groupHeaders`| List<string> | Lấy từ searchModel
`showingColumns` | List<string> | Lấy từ searchModel, dùng để xác định key cho tầng cuối cùng
`dataType` | ETableDataType? | giá trị enum xác định kiểu dữ liệu của T, truyền null nếu table không cần action
`getDescriptions` | Func<T, List<T>> | Hàm trả về danh sách chứa chi tiết của đối tượng chính (ví dụ như thuốc trong gói)

Hàm GroupHeader không có dataType

### d) Return data từ controller về JS

## 3. JS render Component EHealthMasterTable
Các props truyền vào

Name | Type | Description
:--- | :--- | :---
`searchModel` | object | searchModel phải kế thừa BaseTableFilterModel (c#). Nếu có các phương thức sort, group, ẩn hiện cột thì bắt buộc phải truyền
`getData`| func | Hàm get lại dữ liệu cho bảng
`isPaging`| bool | Có phân trang hay không
`pagingData`| object | Nếu isPaging == true thì bắt buộc phải truyền, đây là pagination<T> từ db trả về
onGroupByColumn, onShowingColumnsChanged, onSort, reloadAfterColumnConfigChanged bị vô hiệu hóa
các props còn lại sẽ được truyền nguyên vẹn vào TableComponent

## 4. Ví dụ cụ thể (xem trang /ConsumableList)

### a) ConsumableListPageModel.cs (model get lần đầu cho trang)
```cshaph
public class ConsumableListPageModel
    {
        public ConsumableRawSearchModel SearchModel { get; set; }
        public Pagination<IBaseTableItem> TableData { get; set; }
    }
```

### b) ConsumableRawSearchModel.cs (model search cho bảng)
```cshaph
public class ConsumableRawSearchModel: BaseTableFilterModel
    {
        public List<int> GroupIds { get; set; }
        public ConsumableRawSearchModel(): base()
        {
            GroupIds = new List<int>();
        }
    }
```

### c) API Get data lần đầu cho trang
```cshaph
        [HttpGet]
        public async Task<Acknowledgement<ConsumableListPageModel>> GetConsumableListPageModel()
        {
            var ack = new Acknowledgement<ConsumableListPageModel>();
            ack.IsSuccess = true;
            ack.Data = new ConsumableListPageModel()
            {
                SearchModel = new ConsumableRawSearchModel(),
                TableData = new Pagination<IBaseTableItem>(),
            };
            return ack;
        }
```

### d) API Get data cho bảng
#### _Controller_

```cshaph
        [HttpPost]
        public async Task<Acknowledgement<Pagination<IBaseTableItem>>> GetConsumableRawList(ConsumableRawSearchModel searchModel)
        {
            var result = await EHealthService.GetConsumableRawList(searchModel);
            var ack = new Acknowledgement<Pagination<IBaseTableItem>>();
            ack.IsSuccess = result.IsSuccess;
            ack.ErrorMessage = result.ErrorMessage;
            ack.SuccessMessage = result.SuccessMessage;

            if (result.IsSuccess == true)
            {
                ack.Data = new Pagination<IBaseTableItem>()
                {
                    PageIndex = result.Data.PageIndex,
                    PageSize = result.Data.PageSize,
                    TotalItem = result.Data.TotalItem,
                    DataList = result.Data.DataList.GroupActionHeader(searchModel.GroupByColumns, searchModel.ShowingColumns, ETableDataType.Consumable, i => i.BatchList)
                };
            }
            return ack;
        }
```

#### _ServiceHost_
```cshaph
public async Task<Acknowledgement<Pagination<ConsumableRaw>>> GetConsumableRawList(ConsumableRawSearchModel searchModel)
        {
            var context = EHealthReadonlyContext;
            var guid = Guid.NewGuid();
            var date = DateTime.Now;
            var query = (from consumable in context.Consumables

                         join parentConsumable in context.Consumables on consumable.ParentId equals parentConsumable.Id into p1
                         from parentConsumable in p1.DefaultIfEmpty()

                         join medication in context.Medications on consumable.Id equals medication.ConsumableId into m
                         from medication in m.DefaultIfEmpty()

                         join hoatChat in context.HoatChats on medication.HoatChatId equals hoatChat.Id into h
                         from hoatChat in h.DefaultIfEmpty()

                         join manufactor in context.Manufactors on consumable.ManufactorId equals manufactor.Id

                         select new ConsumableRaw()
                         {
                             GroupId = consumable.ParentId,
                             GroupName = parentConsumable.Name,
                             Id = consumable.Id,
                             Code = consumable.Code,
                             Name = consumable.Name,
                             HoatChatId = hoatChat.Id,
                             TenHoatChat = "Hoạt chất ABC",
                             HamLuong = medication.HamLuong,
                             Min = 0,
                             Max = 100,
                             UsageUnitName = "viên",
                             UsageQuantity = 20,
                             UnitId = 0,
                             UnitName = "hộp",
                             Quantity = 10,
                             ManufactorId = consumable.ManufactorId,
                             ManufactorName = manufactor.Name,
                             Cost = 1000,
                             BatchId = guid,
                             BatchNumber = "",
                             Date = date,
                             WareHouseId = 0,
                             WareHouseName = "",
                             HospitalId = 0,
                             HospitalName = ""
                         });

            var data = await query.DynamicGroup(searchModel);


            data.DataList.ForEach(i =>
            {
                i.ActionPoints = new List<EActionPoint>() { EActionPoint.Unbox };
                i.BatchList = new List<ConsumableRaw>()
                {
                    new ConsumableRaw()
                };
            });

            var ack = new Acknowledgement<Pagination<ConsumableRaw>>()
            {
                IsSuccess = true,
                Data = data
            };
            return ack;
        }
```
### e) JS

#### _ConsumableListPage_

```js
export default class ConsumableListPage extends PageLayout {
  constructor(props) {
    super(props);
  }

  _getConsumableData = () => {
    let { data } = this.props;
    this.ajaxPost({
      url: '/api/consumable/GetConsumableRawList',
      data: data.searchModel,
      success: (ack) => {
        let { data } = this.props;
        this.updateObject(data.tableData, ack.data);
      }
    })
  }

  _getDefaultData = (callback) => {
    let { data } = this.props;
    this.ajaxGet({
      url: '/api/consumable/GetConsumableListPageModel',
      success: (ack) => {
        this.updateObject(data, ack.data, callback);
      }
    })
  }

  renderBody() {
    let { data } = this.props;
    return (
      <ConsumableListTable
        data={data}
        getData={this._getConsumableData}
      />
    );
  }

  loadData(callback) {
    this._getDefaultData(callback);
  }
}
```

#### _ConsumableListTable_

```js
class ConsumableListTable extends EHealthBaseConsumer {
    constructor(props) {
        super(props);

        let i = 1;
        this._columnConfig = [
            createColumn(i++, EConsumableRaw.GroupName, "Phân loại", true),
            createColumn(i++, EConsumableRaw.Code, "Mã hàng", true),
            createColumn(i++, EConsumableRaw.Name, "Tên hàng", true),
            createColumn(i++, EConsumableRaw.TenHoatChat, "Hoạt chất", true),
            createColumn(i++, EConsumableRaw.HamLuong, "Hàm lượng", true),
            createColumn(i++, EConsumableRaw.Min, "MIN", true),
            createColumn(i++, EConsumableRaw.Max, "MAX", true),
            createColumn(i++, EConsumableRaw.UsageQuantity, "SL tồn quy đổi (ĐVT)", true),
            createColumn(i++, EConsumableRaw.UsageUnitName, "Đơn vị quy đổi", true),
            createColumn(i++, EConsumableRaw.UnitName, "Quy cách đóng gói", true),
            createColumn(i++, EConsumableRaw.Quantity, "SL theo QCĐG", true),
            createColumn(i++, EConsumableRaw.ManufactorName, "Nhà cung cấp", true),
            createColumn(i++, EConsumableRaw.Cost, "Giá nhập", true),
            createColumn(i++, EConsumableRaw.BatchNumber, "Số lô", true),
            createColumn(i++, EConsumableRaw.Date, "Date", true),
            createColumn(i++, EConsumableRaw.WareHouseName, "Kho", true),
            createColumn(i++, EConsumableRaw.HospitalName, "Bệnh viện", true),
        ];
    }

    _getButton = () => {
        return [
            <EHealthButton width="120px" variant="solid" margin={["no", "no", "no", "md"]}>
                Duyệt
            </EHealthButton>,
            <UnboxButton />
        ];
    }

    _onShowingColumnsChanged = (ids) => {
        let { data, getData } = this.props;
        let { searchModel } = this.props.data;
        this.updateObject(searchModel, { showingColumns: ids }, getData)
    }

    _onGroupByColumn = (ids) => {
        let { data, getData } = this.props;
        let { searchModel } = data;
        this.updateObject(searchModel, { groupByColumns: ids }, getData)
    }

    _renderHeaderCell = (row, index, visibleColumnsLength, columnConfig, headerKey) => {
        let data = row.data;
        return (
            <BodyCell
                colSpan={visibleColumnsLength}>
                {data[ehealth.toCamelString(headerKey)]}
            </BodyCell>
        );
    }

    consumerContent() {
        let { data, getData } = this.props;
        return (
            <Fragment>
                <EHealthMasterTable
                    hover
                    selectable
                    canEditColumnConfig
                    filterComponent={
                        <div>kahsdkajsh</div>
                    }
                    groupedData={data.tableData.dataList}
                    columnConfig={this._columnConfig}
                    customRenderMap={this._customRenderMap}
                    buttons={this._getButton()}
                    canGroupByColumn={true}
                    getData={getData}
                    searchModel={data.searchModel}
                />
            </Fragment>
        );
    }

    componentDidMount() {
        let { data, getData } = this.props;
        this.updateObject(data.searchModel, { showingColumns: this._columnConfig.filter(i => i.isVisible).map(i => i.key), orderBy: EConsumableRaw.Name }, getData)
    }
}
```


# Đối với những trường hợp cần sử dụng table cơ bản (không cần showingColumns, groupByColumns,...) thì dùng EHealthBasicTable
Name | Type | IsRequired | Description
:--- | :--- | :--- | :---
`data` | array | true | list dữ liệu
`pageIndex`| number |  | trang hiện tại
`totalPage`| number | | tổng số trang, nếu totalPage và pageIndex khác undefined thì xuất hiện paging
`onChangePage`| func |  | hàm chuyển trang, param đầu vào là pageIndex mới
`headRow`| func | true | hàm không nhận param, return về <TableRow> chứa nhiều <TableCell> (các cell render ở header)
`bodyRow`| func | true | hàm nhận vào item, index (truy ra từ data), return về <TableRow> chứa nhiều <TableCell>, nếu muốn return nhiều <TableCell> thì bao bằng <React.Fragment>
Tất cả các props còn lại tương tự I3BasicTable
 
 Ví dụ
 ```js
              <EHealthBasicTable
                    data={data.tableData.dataList}
                    pageIndex={data.tableData.pageIndex}
                    totalPage={data.tableData.totalPage}
                    onChangePage={(newPageIndex) => { console.log(newPageIndex) }}
                    headRow={() => {
                        return (
                            <TableRow>
                                {this._columnConfig.map((i, index) => {
                                    return <TableCell>{i.title}</TableCell>
                                })}
                            </TableRow>
                        );
                    }}

                    bodyRow={(item, index) => {
                        return (
                            <React.Fragment>
                                <TableRow>
                                    {this._columnConfig.map((i, cIndex) => {
                                        return <TableCell>{index}</TableCell>
                                    })}
                                </TableRow>
                                <TableRow>
                                    {this._columnConfig.map((i, cIndex) => {
                                        return <TableCell>{index}</TableCell>
                                    })}
                                </TableRow>
                            </React.Fragment>
                        );
                    }}
                />
 ```
