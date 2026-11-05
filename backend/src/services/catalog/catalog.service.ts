import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, CatalogItemType, OrderMessage, OrderStatus, CatalogItem, CatalogItemStatus } from '../../model/mysql.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CatalogService {
    
    constructor(
        @InjectRepository(CatalogItem)
        private catalogItemRepository: Repository<CatalogItem>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}
    
    async seedDatabase() {
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "dog", cost: 100.00, status: CatalogItemStatus.ACTIVE}) // 0
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "cat", cost: 105.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "wolf", cost: 120.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "fox", cost: 130.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "dragon", cost: 190.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "bear", cost: 155.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.DESIGN, variant: "panda", cost: 170.00, status: CatalogItemStatus.ACTIVE})

        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "red", cost: 15.00, status: CatalogItemStatus.ACTIVE}) // 7
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "orange", cost: 13.50, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "yellow", cost: 12.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "green", cost: 12.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "blue", cost: 10.50, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "purple", cost: 11.50, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "white", cost: 8.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.PALETTE, variant: "black", cost: 9.00, status: CatalogItemStatus.ACTIVE})

        await this.catalogItemRepository.save({ type: CatalogItemType.MATERIAL, variant: "felt", cost: 25.25, status: CatalogItemStatus.ACTIVE}) // 15
        await this.catalogItemRepository.save({ type: CatalogItemType.MATERIAL, variant: "wool", cost: 95.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.MATERIAL, variant: "yarn", cost: 40.50, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.MATERIAL, variant: "leather", cost: 150.00, status: CatalogItemStatus.ACTIVE})
        await this.catalogItemRepository.save({ type: CatalogItemType.MATERIAL, variant: "plastic", cost: 15.10, status: CatalogItemStatus.ACTIVE})
        const catalogItems = await this.searchCatalog({})
        return catalogItems.map((catalogItem) => catalogItem.id)
    }

    async searchCatalog(catalogItem: Partial<CatalogItem>) {
        if (Object.keys(catalogItem).length === 0) {
            // use cache on empty searches (not viable once pagination is required)
            const cachedCatalogItems = await this.cacheManager.get("catalogItems")
            if (cachedCatalogItems) {
                return cachedCatalogItems as CatalogItem[]
            }
            const catalogItems = await this.catalogItemRepository.find({
                where: {
                    status: CatalogItemStatus.ACTIVE
                }
            });
            await this.cacheManager.set("catalogItems", catalogItems, 60000)
            return catalogItems
        } else {
            // filtered searches
            return await this.catalogItemRepository.find({
                where: {
                    status: CatalogItemStatus.ACTIVE,
                    ...catalogItem,
                },
            });
        }
    }

    async createCatalogItem(catalogItem: Partial<CatalogItem>) {
        if (!catalogItem.type || !catalogItem.variant || !catalogItem.cost) {
            throw new BadRequestException('Request is missing some properties');
        }
        await this.cacheManager.del("catalogItems")
        return await this.catalogItemRepository.save({
            type: catalogItem.type,
            variant: catalogItem.variant,
            cost: catalogItem.cost,
            status: CatalogItemStatus.ACTIVE
        })
    }

    async getCatalogItem(id: string) {
        const cachedCatalogItem = await this.cacheManager.get("catalogItem-"+id)
        if (cachedCatalogItem) {
            return cachedCatalogItem as CatalogItem
        }
        const catalogItem = await this.catalogItemRepository.findOne({
            where: {id: id},
        });
        await this.cacheManager.set("catalogItem-"+id, catalogItem, 60000)
        return catalogItem
    }

    async updateCatalogItem(id: string, catalogItem: Partial<CatalogItem>) {
        const _catalogItem = await this.catalogItemRepository.findOneBy({ id });
        if (_catalogItem) {
            _catalogItem.type = catalogItem.type ?? _catalogItem.type
            _catalogItem.variant = catalogItem.variant ?? _catalogItem.variant
            _catalogItem.cost = catalogItem.cost ?? _catalogItem.cost
            await this.cacheManager.del("catalogItems")
            await this.cacheManager.del("catalogItem-"+id)
            return await this.catalogItemRepository.save(_catalogItem);
        }
        throw new BadRequestException('Operation failed');
    }

    async deleteCatalogItem(id: string) {
        await this.cacheManager.del("catalogItems")
        await this.cacheManager.del("catalogItem-"+id)
        return await this.catalogItemRepository.delete(id)
    }

    async disableCatalogItem(id: string) {
        const _catalogItem = await this.catalogItemRepository.findOneBy({ id });
        if (_catalogItem) {
            _catalogItem.status = CatalogItemStatus.DISABLED
            await this.cacheManager.del("catalogItems")
            await this.cacheManager.del("catalogItem-"+id)
            return await this.catalogItemRepository.save(_catalogItem);
        }
    }
}
