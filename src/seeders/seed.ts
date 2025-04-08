// src/seeders/super-admin.seeder.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RoleType } from 'src/roles/role.enum';
import { RolesService } from 'src/roles/roles.service';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService, private readonly rolesService: RolesService) {}

  async onApplicationBootstrap() {
    // const defaultRoles = ['super-admin', 'admin', 'staff', 'user'];

    // for (const roleName of defaultRoles) {
    //   const exists = await this.rolesService.findByName(roleName);
    //   if (!exists) {
    //     await this.rolesService.createRole(roleName);
    //     console.log(`✅ Role "${roleName}" created`);
    //   } else {
    //     console.log(`⚠️ Role "${roleName}" already exists`);
    //   }
    // }

    await this.rolesService.createDefaultRoles()

    const phone_number = '9999999999'; // your super-admin number

    const existingUser = await this.usersService.findByPhone(phone_number);
    if (!existingUser) {
      await this.usersService.createUser({
        fullname: 'Super Admin',
        phone_number,
        role: RoleType.SUPER_ADMIN,
        createdBy: null,
        groupId: 'root', // or some meaningful ID
        profile_pic: null,
        pan_card: null,
        aadhar_card: null,
        gst_no: null,
        email: 'admin@example.com',
        otp: null,
        otp_expiration: null,
        otp_mode: null,
        otp_attempts: 0,
        role_id: null,
      }, "1");

      console.log('✅ Super-admin seeded successfully');
    } else {
      console.log('⚠️ Super-admin already exists');
    }
  }
}
