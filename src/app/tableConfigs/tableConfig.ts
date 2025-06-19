import type {ColumnsType} from "antd/es/table";

export interface TableConfig<T = any> {
    title: string;
    columns: ColumnsType<T>;
    data: T[];
}
