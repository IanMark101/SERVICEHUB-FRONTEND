import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FormalSelect from './FormalSelect';

describe('FormalSelect component', () => {
  const options = [
    { value: 'cat-1', label: 'Aircon Service' },
    { value: 'cat-2', label: 'Plumbing' },
  ];

  it('renders trigger with placeholder and opens dropdown with rounded corners on click', () => {
    const handleChange = vi.fn((event) => event.target.value);
    render(
      <FormalSelect
        value=""
        onChange={handleChange}
        options={options}
        placeholder="Select a category..."
        theme="seeker"
      />
    );

    // Initial placeholder displayed on trigger button
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Open dropdown
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Menu is opened with rounded-2xl styling and options list
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(listbox.className).toContain('rounded-2xl');

    // Click an option in the listbox
    const plumbingOption = listbox.querySelector('div:last-child')!;
    fireEvent.click(plumbingOption);

    expect(handleChange).toHaveReturnedWith('cat-2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', () => {
    render(
      <FormalSelect
        value="cat-1"
        onChange={vi.fn()}
        options={options}
        theme="provider"
      />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
