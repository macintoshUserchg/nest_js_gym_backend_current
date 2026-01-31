import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.rolesRepo.find();
  }

  async findById(id: string) {
    const role = await this.rolesRepo.findOne({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string) {
    const role = await this.rolesRepo.findOne({
      where: { name },
    });
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async create(createRoleDto: any) {
    const role = this.rolesRepo.create(createRoleDto);
    return this.rolesRepo.save(role);
  }

  async update(id: string, updateRoleDto: any) {
    await this.rolesRepo.update({ id }, updateRoleDto);
    return this.findById(id);
  }

  async remove(id: string) {
    const role = await this.findById(id);
    await this.rolesRepo.remove(role);
    return { success: true, message: 'Role deleted successfully' };
  }
}
