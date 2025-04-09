import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional, IsString } from 'class-validator';

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
    @IsNumberString()
    page?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ required: false })
    fromDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ required: false })
    toDate?: string;
}
