export default class Project {
    guid: string;
    creator_id: number;
    is_deleted: boolean;
    name: string;
    project_data: string;

    constructor(json?) {
        this.guid = json.guid;
        this.creator_id = json.creator_id;
        this.is_deleted = json.is_deleted;
        this.name = json.name;
        this.project_data = json.project_data;
    }
}