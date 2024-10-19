import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';

interface GetFilterParams {
    city?: string,
    minPrice?: string,
    maxPrice?: string,
    propertyType?: PropertyType
}

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: { url: string }[];
}

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

@Injectable()
export class HomeService {

    constructor(private readonly prismaService: PrismaService) { }

    async getHomes({ city, minPrice,  maxPrice, propertyType }: GetFilterParams): Promise<HomeResponseDto[]> {

        // Build the where clause dynamically based on the filters
        const where: any = {};

        if (city) where.city = city;
        if (propertyType) where.property_type = propertyType;

        if (minPrice) where.price = { gte: parseFloat(minPrice) }; // gte: Greater than or equal to
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }; // lte: Less than or equal to

        // Fetch homes with the applied filters
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                property_type: true,
                number_of_bathroom: true,
                number_of_bedroom: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                }
            },
            where,  // Apply the filters

        });

        if (!homes.length) throw new NotFoundException();

        return homes.map((home) => new HomeResponseDto(home));
    }

    async getHomeById(id: number) {
        const home = await this.prismaService.home.findUnique({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                property_type: true,
                number_of_bathroom: true,
                number_of_bedroom: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                }
            },
            where: {
                id
            }
        });

        if (!home) throw new NotFoundException();

        return new HomeResponseDto(home);
    }

    async createHome({address, numberOfBedrooms, numberOfBathrooms, city, price, landSize, propertyType, images} :CreateHomeParams, userId: number) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bedroom: numberOfBedrooms,
                number_of_bathroom: numberOfBathrooms,
                city,
                price,
                land_size: landSize,
                property_type: propertyType,
                realtor_id: userId
            }
        });

        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id };
        });

        await this.prismaService.image.createMany({ data: homeImages });

        return new HomeResponseDto(home);
    }

    async updateHomeById({address, numberOfBedrooms, numberOfBathrooms, city, price, landSize, propertyType} :UpdateHomeParams, id: number) {
        const isExists = await this.prismaService.home.findUnique({
            where: {
                id
            }
        });

        if (!isExists) throw new NotFoundException();

        const home = await this.prismaService.home.update({
            where: {
                id
            },
            data: {
                address,
                number_of_bedroom: numberOfBedrooms,
                number_of_bathroom: numberOfBathrooms,
                city,
                price,
                land_size: landSize,
                property_type: propertyType,
                realtor_id: 1
            }
        });

        return new HomeResponseDto(home);
    }

    async deleteHomeById(id: number) {
        await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        });

        await this.prismaService.home.delete({
            where: {
                id
            }
        });
    }

}
