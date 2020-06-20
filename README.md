# TableComponent
Đây là component Table đã handle sẵn một số logic cần thiết cho những trang sử dụng Table phức tạp
Dưới đây là một layout khá chung cho một trang sử dụng table

![](./layout.png)

Trong đó có các phần chính như:
- Filter
- Nút tìm kiếm
- Nút chỉnh sửa cột
- Table chính
- Bottom Action Drawer (sẽ nói sau)

Nhiệm vụ của `TableComponent` là layout và handle các logic cần thiết

### Props
Name | Type | Default | Description
:--- | :--- | :--- | :---
`dataList` | array of selectable shape <sup>(*)</sup> | | data cho table
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

<sup>(*)</sup>
```jsx
dataList: PropTypes.arrayOf(PropTypes.shape({
            isSelected: PropTypes.bool.isRequired,
            data: PropTypes.object.isRequired,
        })).isRequired,
columnConfig: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isVisible: PropTypes.bool.isRequired,
    headCellProps: PropTypes.object
})).isRequired
```

### Code
```jsx
import { createColumn } from '~/general/tableConfig.js';
// createColumn làm hàm nhận vào các parameter để trả về một object config cho một column
// createColumn = (index, key, title, isVisible, headCellProps = null) => ({ index, key, title, isVisible, headCellProps });

let _columnConfig = [
    createColumn(1, 'id', 'ID', true, {
        sortable: true,
        orderBy: 'abc'
    }),
    createColumn(2, 'name', 'Name', true),
    createColumn(3, 'age', 'Age', true),
    createColumn(4, 'city', 'City', true),        
]

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
    dataList={dataList}
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
Chúng ta đã có [`BaseAction`](https://github.com/i3team/general#1-baseaction) được sử dụng khi muốn tập trung logic vào một component, nhưng cách render ở từng trường hợp sử dụng lại khác nhau
Và đây là `BaseButton`, được sử dụng để implement một số Button có chức năng đặc biệt, được sử dụng nhiều lần và có một số logic chung, chẳng hạn như:
- logic thể hiện nút đó có được render hay không
<i>123</i>

Trong quá trình dev, `BaseButton` sẽ có rất nhiều implementation (component kế thừa nó) khác nhau

# BaseTableButton
