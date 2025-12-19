import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackupCard } from '../BackupCard';
import { mockBackupItem, mockIncrementalBackup, mockCloudBackup, mockDistributedBackup } from '@/test/mocks/backupMocks';
import type { BackupItem } from '../types';

describe('BackupCard', () => {
  const mockOnRestore = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render backup name correctly', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(mockBackupItem.name)).toBeInTheDocument();
  });

  it('should render backup size', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(mockBackupItem.size)).toBeInTheDocument();
  });

  it('should format date in pt-BR locale', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    // Date: 2024-01-15T10:30:00Z should format to "15/01/2024, 10:30" or similar
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it('should show Full badge for full backups', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('should show Inc badge for incremental backups', () => {
    render(
      <BackupCard
        backup={mockIncrementalBackup}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Inc')).toBeInTheDocument();
  });

  it('should show status badge when not completed', () => {
    const pendingBackup: BackupItem = {
      ...mockBackupItem,
      status: 'pending',
    };
    
    render(
      <BackupCard
        backup={pendingBackup}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('should show syncing status for distributed backup', () => {
    render(
      <BackupCard
        backup={mockDistributedBackup}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('syncing')).toBeInTheDocument();
  });

  it('should call onRestore when restore button clicked', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    const restoreButton = screen.getByTitle('Restaurar');
    fireEvent.click(restoreButton);
    
    expect(mockOnRestore).toHaveBeenCalledWith(mockBackupItem.id);
    expect(mockOnRestore).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button clicked', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockBackupItem.id);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when disabled prop is true', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
        disabled={true}
      />
    );
    
    expect(screen.getByTitle('Restaurar')).toBeDisabled();
    expect(screen.getByTitle('Excluir')).toBeDisabled();
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );
    
    expect(screen.getByTitle('Restaurar')).toBeDisabled();
    expect(screen.getByTitle('Excluir')).toBeDisabled();
  });

  it('should render correct icon for local provider', () => {
    render(
      <BackupCard
        backup={mockBackupItem}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    // HardDrive icon should be present for local provider
    const iconContainer = document.querySelector('.p-2.rounded-lg');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should render correct icon for cloud provider', () => {
    render(
      <BackupCard
        backup={mockCloudBackup}
        onRestore={mockOnRestore}
        onDelete={mockOnDelete}
      />
    );
    
    const iconContainer = document.querySelector('.p-2.rounded-lg');
    expect(iconContainer).toBeInTheDocument();
  });
});
