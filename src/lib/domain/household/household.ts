export type HouseholdRole = 'owner' | 'member';

export interface Household {
	id: string;
	name: string;
	inviteCode: string | null;
	inviteExpiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}
