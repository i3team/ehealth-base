# TableComponent
Đây là component Table đã handle sẵn một số logic cần thiết cho những trang sử dụng Table phức tạp
Dưới đây là một layout khá chung cho một trang sử dụng table

![](https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/103798692_284040956296681_4382980585929074992_n.png?_nc_cat=105&_nc_sid=b96e70&_nc_oc=AQkHDm21q5TTEDV0YT8RADDZSCS4rnvCBQ95HtTMm6q6RE8LkSgioLlLJhzUnUxDk48&_nc_ht=scontent.fsgn5-2.fna&oh=027d50b084d50561e930628b5bf7f3b5&oe=5F13C8B3)

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
`currentOrderBy` | props này của Table (xem [Table](https://github.com/i3team/i3-table))
`getRowKey`| props này của Table (xem [Table](https://github.com/i3team/i3-table))
`onSort` | props này của Table (xem [Table](https://github.com/i3team/i3-table))
`pageType` | number | | giá trị của enum EPageType
`selectable` | bool | false | true thì sẽ handle checkbox và bottom drawer

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

# BaseButton

# BaseTableButton
