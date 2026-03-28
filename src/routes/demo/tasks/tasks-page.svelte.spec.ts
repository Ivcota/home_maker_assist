import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TasksPage from './+page.svelte';

describe('/demo/tasks page', () => {
	it('renders form with title and priority inputs and submit button', async () => {
		render(TasksPage, { data: { tasks: [] }, form: null });

		await expect.element(page.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
		await expect.element(page.getByRole('spinbutton', { name: /priority/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /add task/i })).toBeInTheDocument();
	});

	it('renders tasks passed in data prop', async () => {
		const tasks = [
			{ id: 1, title: 'Buy milk', priority: 2, completedAt: null },
			{ id: 2, title: 'Walk dog', priority: 1, completedAt: null }
		];

		render(TasksPage, { data: { tasks }, form: null });

		await expect.element(page.getByText('Buy milk')).toBeInTheDocument();
		await expect.element(page.getByText('Walk dog')).toBeInTheDocument();
	});

	it('renders complete and remove buttons for each task', async () => {
		const tasks = [
			{ id: 1, title: 'Buy milk', priority: 2, completedAt: null },
			{ id: 2, title: 'Walk dog', priority: 1, completedAt: null }
		];

		render(TasksPage, { data: { tasks }, form: null });

		const completeButtons = page.getByRole('button', { name: /mark as complete/i });
		await expect.element(completeButtons.nth(0)).toBeInTheDocument();
		await expect.element(completeButtons.nth(1)).toBeInTheDocument();

		const removeButtons = page.getByRole('button', { name: /remove task/i });
		await expect.element(removeButtons.nth(0)).toBeInTheDocument();
		await expect.element(removeButtons.nth(1)).toBeInTheDocument();
	});

	it('completed tasks render with visual distinction', async () => {
		const tasks = [
			{ id: 1, title: 'Done task', priority: 1, completedAt: new Date() },
			{ id: 2, title: 'Pending task', priority: 1, completedAt: null }
		];

		render(TasksPage, { data: { tasks }, form: null });

		// Completed task title has line-through styling
		const doneTitle = page.getByText('Done task');
		await expect.element(doneTitle).toHaveClass('line-through');

		// Pending task title does not have line-through
		const pendingTitle = page.getByText('Pending task');
		await expect.element(pendingTitle).not.toHaveClass('line-through');
	});
});
