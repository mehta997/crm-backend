import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { RolesService } from '../roles/roles.service';
import { RoleType } from '../roles/role.enum';
import { decrypt, encrypt } from 'src/common/utils/encryption';
import { generateGroupId } from 'src/common/utils/generateGroupId';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly rolesService: RolesService,
  ) { }

  async createUser(dto: CreateUserDto, createdBy: string): Promise<User> {
    const role = await this.rolesService.findByName(dto.role);
    if (!role) throw new NotFoundException('Role not found');

    const user = new this.userModel({
      fullname: dto.fullname,
      phone_number: dto.phone_number,
      email: dto.email,
      role: dto.role,
      role_id: role._id,
      pan_card: dto.pan_card ? encrypt(dto.pan_card) : undefined,
      aadhar_card: dto.aadhar_card ? encrypt(dto.aadhar_card) : undefined,
      gst_no: dto.gst_no,
      groupId: dto.groupId || generateGroupId(),
      createdBy,
      otp: dto.otp || "",
      otp_expiration: dto.otp_expiration || "",
      otp_mode: dto.otp_mode || "SMS",
      otp_attempts: dto.otp_attempts || "",
    });

    return user.save();
  }

  async findAll(filterDto: FilterUserDto): Promise<User[]> {
    const query = this.userModel.find();

    if (filterDto.fullname) query.where('fullname').equals(filterDto.fullname);
    if (filterDto.phone_number) query.where('phone_number').equals(filterDto.phone_number);
    if (filterDto.groupId) query.where('groupId').equals(filterDto.groupId);
    if (filterDto.pan_card) query.where('pan_card').equals(encrypt(filterDto.pan_card));
    if (filterDto.aadhar_card) query.where('aadhar_card').equals(encrypt(filterDto.aadhar_card));
    // if (filterDto.createdBy) query.where('createdBy').equals(filterDto.createdBy);

    if (filterDto.fromDate || filterDto.toDate) {
      const from = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date(0);
      const to = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
      // query.where('createdAt').gte(from).lte(to);
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    query.skip((+page - 1) * +limit).limit(+limit);

    const data = await query.exec();
    data.forEach(item => {
      item.pan_card = decrypt(item.pan_card);
      item.aadhar_card = decrypt(item.aadhar_card)
    })
    return data
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ uid: id });
    if (!user) throw new NotFoundException('User not found');
    const decryptedUser = {
      ...user.toObject(),
      pan_card: decrypt(user.pan_card),
      aadhar_card: decrypt(user.aadhar_card),
    };
    return decryptedUser;
  }

  async updateUser(id: string, dto: UpdateUserDto, currentUser: User): Promise<User> {
    const userDoc = await this.userModel.findOne({ uid: id });
    if (!userDoc) throw new NotFoundException('User not found');

    if (dto.pan_card) dto.pan_card = encrypt(dto.pan_card);
    if (dto.aadhar_card) dto.aadhar_card = encrypt(dto.aadhar_card);

    Object.assign(userDoc, dto, { updatedBy: currentUser.uid });
    return userDoc.save();
  }

  async deleteUser(id: string, currentUser: User): Promise<void> {
    if (![RoleType.SUPER_ADMIN, RoleType.ADMIN].includes(currentUser.role as RoleType)) {
      throw new ForbiddenException('Only admin or super-admin can delete users');
    }

    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('User not found');
  }

  async findByPhone(phone_number: string): Promise<User | null> {
    return this.userModel.findOne({ phone_number });
  }

  async findByUid(uid: string): Promise<User | null> {
    return this.userModel.findOne({ uid });
  }

  async getSelfData(currentUser: User): Promise<User> {
    const user = await this.findByUid(currentUser.uid);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAllByGroup(currentUser: User): Promise<User[]> {
    return this.userModel.find({ groupId: currentUser.groupId });
  }


}
