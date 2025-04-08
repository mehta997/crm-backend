import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullname?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone_number?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    groupId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pan_card?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    aadhar_card?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    fromDate?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    toDate?: string;
}
