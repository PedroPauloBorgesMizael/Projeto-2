export interface CreateTicketDTO {
    title: string;
    description: string;
    category?: string;
    categoryId?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    location?: string;
    locationId?: string;
    requesterId: string;
}