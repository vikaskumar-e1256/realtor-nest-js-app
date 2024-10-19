import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto, CreateHomeDto, UpdateHomeDto } from './dtos/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { AuthUser, UserInfo } from 'src/user/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/decorators/role.decorator';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService){}

    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType,
    ): Promise<HomeResponseDto[]> {
        // Pass the query parameters to the service method
        return this.homeService.getHomes({ city, minPrice, maxPrice, propertyType });
    }

    @Get(':id')
    getHome(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.homeService.getHomeById(id);
    }

    @Role(UserType.ADMIN, UserType.REALTOR)
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    createHome(
        @Body() body: CreateHomeDto,
        @AuthUser() user: UserInfo
    ) {
        console.log(user);
        return user;
        return this.homeService.createHome(body, user.id);
    }

    @Put(':id')
    updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto
    ) {
        return this.homeService.updateHomeById(body, id);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteHome(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.homeService.deleteHomeById(id);
    }
}
