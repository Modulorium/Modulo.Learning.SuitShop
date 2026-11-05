import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from "typeorm";
import type { Relation } from "typeorm";

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

export enum OrderStatus {
    PROCESSING = "processing",
    PLACED = "placed",
    IN_PROGRES = "in_progress",
    READY = "ready",
    SHIPPED = "shipped",
}

export enum CatalogItemStatus {
    ACTIVE = "active",
    DISABLED = "disabled",
}

export enum CatalogItemType {
    DESIGN = "design",
    MATERIAL = "material",
    PALETTE = "palette",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    username: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ default: UserRole.USER })
    role: UserRole;

    // Relations
    @OneToMany(() => Order, (order) => order.user)
    orders: Relation<Order[]>;
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string

    @Column({ default: OrderStatus.PROCESSING })
    status: OrderStatus;
    
    // Relations
    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: "userId" })
    user: Relation<User>;

    @OneToMany(() => OrderItem, (item) => item.order)
    items: Relation<OrderItem[]>;

    @OneToMany(() => OrderMessage, (message) => message.order)
    messages: Relation<OrderMessage[]>;
}


@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    
    @Column()
    orderId: string
    
    @Column()
    quantity: number

    @Column()
    catalogId: string

    // Relations
    @ManyToOne(() => Order, (order) => order.items)
    @JoinColumn({ name: "orderId" })
    order: Relation<Order>;

    @ManyToOne(() => CatalogItem, (catalogItem) => catalogItem.orderItems)
    @JoinColumn({ name: "catalogId" })
    catalogItem: Relation<CatalogItem>;    
}

@Entity()
export class OrderMessage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    orderId: string
    
    @CreateDateColumn()
    created: Date
    
    @Column()
    userId: string
    
    @Column()
    message: string

    // Relations
    @ManyToOne(() => Order, (order) => order.items)
    @JoinColumn({ name: "orderId" })
    order: Relation<Order>;
    
    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: "userId" })
    user: Relation<User>;
}

@Entity()
export class CatalogItem {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    type: CatalogItemType
    
    @Column()
    variant: string

    @Column("decimal", { precision: 10, scale: 2 })
    cost: number

    @Column({ default: CatalogItemStatus.ACTIVE })
    status: CatalogItemStatus

    @OneToMany(() => OrderItem, (orderItem) => orderItem.catalogItem)
    orderItems: Relation<OrderItem[]>
}
