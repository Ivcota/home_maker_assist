export interface Task {
	id: number;
	title: string;
	priority: number;
}

export interface CreateTaskInput {
	title: string;
	priority: number;
}
