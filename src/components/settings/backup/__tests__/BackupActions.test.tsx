import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackupActions } from '../BackupActions';

describe('BackupActions', () => {
  const mockOnBackup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render full backup button', () => {
    render(<BackupActions onBackup={mockOnBackup} />);
    
    expect(screen.getByText('Backup Completo')).toBeInTheDocument();
  });

  it('should render incremental button when showIncremental=true', () => {
    render(<BackupActions onBackup={mockOnBackup} showIncremental={true} />);
    
    expect(screen.getByText('Incremental')).toBeInTheDocument();
  });

  it('should hide incremental button when showIncremental=false', () => {
    render(<BackupActions onBackup={mockOnBackup} showIncremental={false} />);
    
    expect(screen.queryByText('Incremental')).not.toBeInTheDocument();
  });

  it('should call onBackup with "full" when full button clicked', () => {
    render(<BackupActions onBackup={mockOnBackup} />);
    
    fireEvent.click(screen.getByText('Backup Completo'));
    
    expect(mockOnBackup).toHaveBeenCalledWith('full');
    expect(mockOnBackup).toHaveBeenCalledTimes(1);
  });

  it('should call onBackup with "incremental" when incremental button clicked', () => {
    render(<BackupActions onBackup={mockOnBackup} showIncremental={true} />);
    
    fireEvent.click(screen.getByText('Incremental'));
    
    expect(mockOnBackup).toHaveBeenCalledWith('incremental');
    expect(mockOnBackup).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when disabled prop is true', () => {
    render(<BackupActions onBackup={mockOnBackup} disabled={true} />);
    
    const fullButton = screen.getByText('Backup Completo').closest('button');
    expect(fullButton).toBeDisabled();
  });

  it('should disable buttons when isLoading is true', () => {
    render(<BackupActions onBackup={mockOnBackup} isLoading={true} />);
    
    const fullButton = screen.getByText('Backup Completo').closest('button');
    expect(fullButton).toBeDisabled();
  });

  it('should show loading spinner when isLoading is true', () => {
    render(<BackupActions onBackup={mockOnBackup} isLoading={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('should not call onBackup when button is disabled', () => {
    render(<BackupActions onBackup={mockOnBackup} disabled={true} />);
    
    const fullButton = screen.getByText('Backup Completo').closest('button');
    if (fullButton) {
      fireEvent.click(fullButton);
    }
    
    expect(mockOnBackup).not.toHaveBeenCalled();
  });
});
