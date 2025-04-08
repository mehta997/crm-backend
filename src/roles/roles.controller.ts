import { Controller, Get, Post, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'admin' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  createRole(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Array of all roles' })
  getRoles() {
    return this.rolesService.getAllRoles();
  }
}
