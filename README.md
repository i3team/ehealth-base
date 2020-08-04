# TableComponent
Đây là component Table đã handle sẵn một số logic cần thiết cho những trang sử dụng Table phức tạp
Dưới đây là một layout khá chung cho một trang sử dụng table

![](./layout.png)

Trong đó có các phần chính như:
- Filter
- Nút tìm kiếm
- Nút chỉnh sửa cột
- Table chính
- Bottom Action Drawer (để hiểu là cái gì, truy cập [Link2.0](http://link2.i3solution.net.au/Search) sau đó check một vài checkbox hoặc check all để xem)

Nhiệm vụ của `TableComponent` là layout và handle các logic cần thiết

### Props
Name | Type | Default | Description
:--- | :--- | :--- | :---
`groupedData` | array of grouped  <sup>(*)</sup> | | data cho table ở dạng grouped
`renderFooterCells` | | |
`renderHeaderCells` | | |
`columnConfig` | array of columnConfigShape <sup>(*)</sup> | | config về thứ cột, ... 
`customRenderMap` | `Map` of custom render | | 
`filterComponent` | node | | phần React node render filter
`onClickSearch` | func | | callback khi nhấn nút search
`onSort` | props này của Table (xem [Table](https://github.com/i3team/i3-table))
`currentOrderBy` | props này của Table (xem [Table](https://github.com/i3team/i3-table))
`getRowKey`| props này của Table (xem [Table](https://github.com/i3team/i3-table))
`pageType` | number | | giá trị của enum EPageType
`selectable` | bool | false | true thì sẽ handle checkbox và bottom drawer
`buttons` | node |  | buttons ở bottom drawer
`canEditColumnConfig` | boolean | `false` | `true` thì hiện nút sắp xếp cột
`canGroupByColumn` | boolean | `false` | `true` thì hiện dropdown chọn gom nhóm theo cột
`onGroupByColumn` | func |  | callback sau khi chọn gom nhóm theo cột

<sup>(*)</sup>
```jsx
groupedData: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string.isRequired,
            data: PropTypes.any.isRequired,
            items: PropTypes.array
        }))
columnConfig: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired, // thứ tự sắp xếp cột
    key: PropTypes.string.isRequired, // key từ object data
    title: PropTypes.string.isRequired, // tiêu đề cột
    isVisible: PropTypes.bool.isRequired, // hiển thị
    options: PropTypes.object // (1)
})).isRequired
```
(1) `options` (trước đó là `headCellProps`, chỉ là thêm trường `id`) chứa các props của `HeadCell` của `I3FullTable` và `id` của column `{id, ...headCellProps}`. `id` của column sẽ được lấy từ enum cho việc gom nhóm theo cột, theo đó, khi một table cần chức năng gom nhóm theo cột thì phải định nghĩa ra 1 enum (cả C# lẫn js) với giá trị là number đại diện cho column muốn group, 

Ở js thì tạo object enum trong object `ETableColumnId` ở file `enum.js`
VD:
```jsx
export const ETableColumnId = {
    Test: {
        ConsumableId: 1,
        Status: 2,
        Quantity: 3,
        ConsumableOrderId: 4,
    },
    ... object mới ở đây
}
```
```csharp

public enum Test
{
    ConsumableId = 1,
    Status = 2,
    Quantity = 3,
    ConsumableOrderId = 4,
}
```

Table chỉ cung cấp chức năng chọn cột để gom nhóm, sẽ gọi callback ra ngoài và component sử dụng table sẽ tự động bắn api lấy dữ liệu đã được gom nhóm về.

### Code
```jsx
import { createColumn } from '~/general/tableConfig.js';
// createColumn làm hàm nhận vào các parameter để trả về một object config cho một column
// createColumn = (index, key, title, isVisible, options = null) => ({ index, key, title, isVisible, options });

let _columnConfig = [
    createColumn(1, 'id', 'ID', true, {
        id: ETableColumnId.Test.ConsumableId,
        sortable: true,
        orderBy: 'abc'
    }),
    createColumn(2, 'name', 'Name', true),
    createColumn(3, 'age', 'Age', true),
    createColumn(4, 'city', 'City', true),        
]
// theo code trên thì table có khả năng gom nhóm theo consumable id
let _customRenderMap = new Map();
// custom render trường `id`
_customRenderMap.set('id', row => <b style={{color: 'red'}}>#{row.data.id}</b>)

<TableComponent
    filterComponent={(
        <b>
            filter
        </b>
    )}
    onClickSearch={() => {
        // bắn api search
    }}
    onSort={(sort) => {
       
    }}
    currentOrderBy={'Id'}
    selectable
    getRowKey={row => row.data.id}
    pageType={EPageType.Test}
    groupedData={groupedData}
    columnConfig={_columnConfig}
    customRenderMap={_customRenderMap}
    buttons={(
        <Fragment>
            <EHealthButton width="120px" variant="solid" margin={["no", "no", "no", "md"]}>
                Duyệt
            </EHealthButton>
            <EHealthButton width="120px" variant="outlined" margin={["no", "no", "no", "md"]}>
                Hủy
            </EHealthButton>
        </Fragment>
    )}
/>
```


# BaseButton
[Code](./BaseButton.jsx)

Chúng ta đã có [`BaseAction`](https://github.com/i3team/general#1-baseaction) được sử dụng khi muốn tập trung logic vào một component, nhưng cách render ở từng trường hợp sử dụng lại khác nhau

Và đây là `BaseButton`, được sử dụng để implement một số Button có chức năng đặc biệt, được sử dụng nhiều lần và có một số logic chung

Một số method cần chú ý (những method khác thì là cơ bản của button, ko đáng chú ý)
- `isApplicable() : boolean` : abstract, return `true` thì được render

<i>Sẽ được update thêm</i>

Trong quá trình dev, `BaseButton` sẽ có nhiều implementation (component kế thừa nó) khác nhau được tạo ra

## Một số implementation cơ bản

### BaseTableButton
[Code](./BaseTableButton.jsx)

Là các nút sẽ được dùng ở Bottom drawer của TableComponent, các nút này sẽ thực hiện hành động trên các hàng được check ở table, tuy nhiên không có nghĩa là hàng nào được chọn thì cũng được apply hành động đó, các hàng được chọn sẽ được filter ra

Một số method cần chú ý:
- `isItemApplicable(item: object) : boolean` : abstract, return `true` thì hành động này sẽ tác động lên hàng đó, `false` thì bị "cho ra rìa"
- `actionName() : string` : abstract, tên hành động VD như: Gửi, Duyệt, Trình ký, Hủy, Xóa, ...
- `rowUnitName() : string` : virtual : tên đơn vị của hàng VD như: thuốc, ....

###### Props
Name | Type | Default | Description
:--- | :--- | :--- | :---
`selectedItems`* | array | `[]` | list các hàng đã được check ở Table
`closeDrawer`* | func | `[]` | tắt bottom drawer
`callback` | func | | `callback` được gọi sau khi hành động được thực hiện

Ví dụ có một button là `Xóa đơn`, và điều kiện để một hàng (đơn) bị xóa là trạng thái là 2
```jsx
class DeleteOrderButton extends BaseTableButton {
    variant() {
        return "solid";
    }
    rowUnitName() {
        return "Đơn";
    }
    actionName() {
        return "Xóa";
    }
    isItemApplicable(order){
        return order.status == 2;
    }
    _deleteOrders = () => {
        const { selectedItems, callback } = this.props;
        this.ajaxPost({
            url: '~/DeleteOrders',
            data: selectedItems,
            success: (ack) => {
                typeof callback === 'function' && callback(ack.data);
            }
        })
    }
    onClick() {
        this._deleteOrders();
    }
}
```



