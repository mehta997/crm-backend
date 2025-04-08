// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name });
  }
  
  async createDefaultRoles(): Promise<void> {
    const defaultRoles = ['super-admin', 'admin', 'staff', 'user'];

    for (const name of defaultRoles) {
      const exists = await this.roleModel.findOne({ name });
      if (!exists) {
        await this.roleModel.create({ name });
        console.log(`Role "${name}" created.`);
      }
    }
  }

  async createRole(name: string): Promise<Role> {
    const existing = await this.roleModel.findOne({ name });
    if (existing) return existing;
  
    const role = new this.roleModel({ name });
    return role.save();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }
}
