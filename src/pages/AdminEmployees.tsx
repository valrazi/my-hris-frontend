import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import { Column, CustomTable } from '../components/common/CustomTable';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { Modal } from '../components/common/Modal';
import {
  CreateEmployeePayload,
  useCreateEmployee,
  useDeleteEmployee,
  useGetEmployees,
  useUpdateEmployee,
} from '../hooks/useEmployees';
import { User } from '../types';

const employeeSchema = z.object({
  nik: z.string().min(1, 'NIK is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const AdminEmployees: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading } = useGetEmployees({ page, limit: 10, search, department });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nik: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      department: 'Engineering',
      position: 'Software Engineer',
      phone: '',
      role: 'EMPLOYEE',
    },
  });

  const openAddModal = () => {
    reset({
      nik: `EMP-${Date.now().toString().slice(-4)}`,
      email: '',
      password: 'Password123!',
      firstName: '',
      lastName: '',
      department: 'Engineering',
      position: 'Software Engineer',
      phone: '',
      role: 'EMPLOYEE',
    });
    setErrorMessage(null);
    setIsAddOpen(true);
  };

  const openEditModal = (emp: User) => {
    setEditingEmployee(emp);
    setValue('nik', emp.nik || '');
    setValue('email', emp.email);
    setValue('firstName', emp.firstName);
    setValue('lastName', emp.lastName);
    setValue('department', emp.department || '');
    setValue('position', emp.position || '');
    setValue('phone', emp.phone || '');
    setValue('role', emp.role);
    setErrorMessage(null);
  };

  const onAddSubmit = async (values: EmployeeFormValues) => {
    try {
      setErrorMessage(null);
      await createMutation.mutateAsync(values as CreateEmployeePayload);
      setIsAddOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create employee';
      setErrorMessage(typeof msg === 'string' ? msg : msg[0]);
    }
  };

  const onEditSubmit = async (values: EmployeeFormValues) => {
    if (!editingEmployee) return;
    try {
      setErrorMessage(null);
      await updateMutation.mutateAsync({
        id: editingEmployee.id,
        ...values,
      });
      setEditingEmployee(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update employee';
      setErrorMessage(typeof msg === 'string' ? msg : msg[0]);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await deleteMutation.mutateAsync(deletingEmployee.id);
      setDeletingEmployee(null);
    } catch (err) {}
  };

  const columns: Column<User>[] = [
    {
      header: 'Employee Name',
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {item.firstName[0]}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.firstName} {item.lastName}</div>
            <div className="text-[11px] text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'NIK / ID',
      accessor: (item) => <span className="font-mono text-slate-700">{item.nik || '-'}</span>,
    },
    {
      header: 'Department',
      accessor: (item) => <span className="font-medium text-slate-700">{item.department || '-'}</span>,
    },
    {
      header: 'Position',
      accessor: (item) => <span className="text-slate-600">{item.position || '-'}</span>,
    },
    {
      header: 'Role',
      accessor: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          item.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {item.role}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${item.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
          {item.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit Employee"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingEmployee(item)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Deactivate Employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HR Employee Master Data</h1>
          <p className="text-xs text-slate-500 mt-1">Manage corporate employee profiles, departments, and credentials</p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
        >
          Add New Employee
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-72">
          <InputField
            placeholder="Search by name, email, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Custom Data Table */}
      <CustomTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="No employee master records found."
        pagination={{
          page,
          totalPages: data?.meta?.totalPages || 1,
          total: data?.meta?.total || 0,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Add Employee Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Employee Record" maxWidth="lg">
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Employee NIK" error={errors.nik?.message} {...register('nik')} />
            <InputField label="Work Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <InputField label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Department" error={errors.department?.message} {...register('department')} />
            <InputField label="Position / Title" error={errors.position?.message} {...register('position')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Initial Password" type="password" error={errors.password?.message} {...register('password')} />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                {...register('role')}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-xs text-slate-900 bg-white"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title="Edit Employee Master Data" maxWidth="lg">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Employee NIK" error={errors.nik?.message} {...register('nik')} />
            <InputField label="Work Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" error={errors.firstName?.message} {...register('firstName')} />
            <InputField label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Department" error={errors.department?.message} {...register('department')} />
            <InputField label="Position / Title" error={errors.position?.message} {...register('position')} />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Update Record</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingEmployee} onClose={() => setDeletingEmployee(null)} title="Deactivate Employee Record" maxWidth="md">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to deactivate <span className="font-bold text-slate-900">{deletingEmployee?.firstName} {deletingEmployee?.lastName}</span>? The employee will no longer be able to log in or submit attendance.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingEmployee(null)}>Cancel</Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleDelete}>Deactivate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
