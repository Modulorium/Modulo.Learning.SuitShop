import { Body, Controller, Delete, Get, Param, Post, Put, QueryMethod, Req } from '@nestjs/common';
import { AppService } from './app.service.js';
import { UserService } from './services/user/user.service.js';
import { CatalogItem, Order, OrderMessage, User } from './model/mysql.js';
import { OrderService } from './services/order/order.service.js';
import { CatalogService } from './services/catalog/catalog.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly catalogService: CatalogService
  ) {}

  @Get("/seed")
  async seedDatabase(): Promise<string> {
    const userIds = await this.userService.seedDatabase();
    const catalogItemIds = await this.catalogService.seedDatabase();
    await this.orderService.seedDatabase(userIds, catalogItemIds);
    return "Database Seeded!"
  }

  @QueryMethod("/users")
  async getUsers(@Body() body: Body): Promise<any> {
    const user: Partial<User> = body as any
    return await this.userService.searchUsers(user);
  }

  @Post("/users")
  async postUsers(@Body() body: Body): Promise<any> {
    const user: Partial<User> = body as any
    return await this.userService.createUser(user);
  }

  @Get("/users/:id")
  async getUser(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.userService.getUser(id);
  }

  @Put("/users/:id")
  async putUser(@Param() params: any, @Body() body: Body): Promise<any> {
    const id: string = params.id as any
    const user: Partial<User> = body as any
    return await this.userService.updateUser(id, user);
  }

  @Delete("/users/:id")
  async deleteUser(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.userService.deleteUser(id);
  }



  @QueryMethod("/catalog")
  async queryCatalog(@Body() body: Body): Promise<any> {
    const catalogItem: Partial<CatalogItem> = body as any
    return await this.catalogService.searchCatalog(catalogItem);
  }

  @Post("/catalog")
  async postCatalog(@Body() body: Body): Promise<any> {
    const catalogItem: Partial<CatalogItem> = body as any
    return await this.catalogService.createCatalogItem(catalogItem);
  }

  @Get("/catalog/:id")
  async getCatalog(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.catalogService.getCatalogItem(id);
  }

  @Put("/catalog/:id")
  async putCatalog(@Param() params: any, @Body() body: Body): Promise<any> {
    const id: string = params.id as any
    const catalogItem: Partial<CatalogItem> = body as any
    return await this.catalogService.updateCatalogItem(id, catalogItem);
  }

  @Delete("/catalog/:id")
  async deleteCatalog(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.catalogService.disableCatalogItem(id);
  }



  @QueryMethod("/orders")
  async queryOrders(@Body() body: Body): Promise<any> {
    const order: Partial<Order> = body as any
    return await this.orderService.searchOrders(order);
  }

  @Post("/orders")
  async postOrders(@Body() body: Body): Promise<any> {
    const data: any = body as any
    return await this.orderService.createOrder(data.userId, data.catalogIds);
  }

  @Get("/orders/:id")
  async getOrder(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.orderService.getOrder(id);
  }

  @Put("/orders/:id")
  async putOrder(@Param() params: any, @Body() body: Body): Promise<any> {
    const id: string = params.id as any
    const order: Partial<Order> = body as any
    return await this.orderService.updateOrder(id, order);
  }

  @Delete("/orders/:id")
  async deleteOrder(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.orderService.deleteOrder(id);
  }

  @Get("/orders/:id/messages")
  async getMessages(@Param() params: any): Promise<any> {
    const id: string = params.id as any
    return await this.orderService.getMessages(id);
  }

  @Post("/orders/:id/messages")
  async postMessage(@Param() params: any, @Body() body: Body): Promise<any> {
    const id: string = params.id as any
    const message: Partial<OrderMessage> = body as any
    return await this.orderService.createMessage(id, message.userId ?? null, message.message ?? '');
  }

}
