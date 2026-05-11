export interface AppNotification {
	id: string;
	title: string;
	body?: string;
	coverUrl?: string;
	duration: number;
}

export type NotificationInput = Omit<AppNotification, 'id'> & { duration?: number };

function createNotificationStore() {
	let notifications = $state<AppNotification[]>([]);
	const MAX = 3;

	return {
		get notifications() { return notifications; },

		push(input: NotificationInput) {
			const n: AppNotification = {
				id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				title: input.title,
				body: input.body,
				coverUrl: input.coverUrl,
				duration: input.duration ?? 4000
			};
			notifications = [n, ...notifications].slice(0, MAX);
			setTimeout(() => this.dismiss(n.id), n.duration + 400);
		},

		dismiss(id: string) {
			notifications = notifications.filter((n) => n.id !== id);
		}
	};
}

export const notificationStore = createNotificationStore();
