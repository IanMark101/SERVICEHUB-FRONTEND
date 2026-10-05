import { createRef, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import FormSelect from './FormSelect';

const options = <><option value="" disabled>Select a category</option><option value="plumbing">Plumbing</option><option value="disabled" disabled>Unavailable</option><option value="aircon">Aircon service</option></>;
function Controlled({ change = vi.fn() }: { change?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return <label>Category<FormSelect name="category" value={value} onChange={event => { change(event.target.value); setValue(event.target.value); }}>{options}</FormSelect></label>;
}

describe('shared form select preserves native form contracts', () => {
  it('clicking a custom option updates the existing controlled value and fires one native change', () => {
    const change = vi.fn(); render(<Controlled change={change} />);
    const select = screen.getByRole('combobox', { name: /Category/ });
    fireEvent.click(select);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Aircon service' }));
    expect(select).toHaveValue('aircon');
    expect(change).toHaveBeenCalledExactlyOnceWith('aircon');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(select).toHaveFocus();
  });
  it('supports keyboard navigation, skips disabled options and selects only on confirmation', () => {
    const change = vi.fn(); render(<Controlled change={change} />);
    const select = screen.getByRole('combobox');
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(select, { key: 'Enter' });
    expect(select).toHaveValue('aircon');
    expect(change).toHaveBeenCalledExactlyOnceWith('aircon');
  });
  it('supports typeahead, Home and End', () => {
    render(<Controlled />); const select = screen.getByRole('combobox');
    fireEvent.click(select); fireEvent.keyDown(select, { key: 'a' }); fireEvent.keyDown(select, { key: 'Enter' });
    expect(select).toHaveValue('aircon');
    fireEvent.click(select); fireEvent.keyDown(select, { key: 'Home' }); fireEvent.keyDown(select, { key: 'Enter' });
    expect(select).toHaveValue('plumbing');
    fireEvent.click(select); fireEvent.keyDown(select, { key: 'End' }); fireEvent.keyDown(select, { key: 'Enter' });
    expect(select).toHaveValue('aircon');
  });
  it('keeps required validation, native FormData and forwarded refs', () => {
    const ref = createRef<HTMLSelectElement>();
    const { container } = render(<form><label htmlFor="native-category">Category</label><FormSelect ref={ref} id="native-category" name="category" required defaultValue="" aria-describedby="help">{options}</FormSelect><span id="help">Choose one</span></form>);
    expect(ref.current?.validity.valueMissing).toBe(true);
    fireEvent.click(ref.current!); fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plumbing' }));
    expect(ref.current?.validity.valid).toBe(true);
    expect(new FormData(container.querySelector('form')!).get('category')).toBe('plumbing');
    expect(ref.current).toHaveAttribute('aria-describedby', 'help');
  });
  it('preserves React Hook Form registration and blur validation', () => {
    const submitted = vi.fn();
    function Registered() {
      const { register, handleSubmit } = useForm({ defaultValues: { category: '' } });
      return <form onSubmit={handleSubmit(submitted)}><label>Category<FormSelect {...register('category', { required: true })}>{options}</FormSelect></label><button type="submit">Save</button></form>;
    }
    render(<Registered />);
    const select = screen.getByRole('combobox');
    fireEvent.click(select); fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plumbing' }));
    fireEvent.blur(select); fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    return vi.waitFor(() => expect(submitted.mock.calls[0]?.[0]).toEqual({ category: 'plumbing' }));
  });
  it('never opens disabled controls or disabled fieldsets', () => {
    render(<><FormSelect disabled aria-label="Disabled">{options}</FormSelect><fieldset disabled><FormSelect aria-label="Fieldset">{options}</FormSelect></fieldset></>);
    for (const select of screen.getAllByRole('combobox')) { fireEvent.click(select); fireEvent.keyDown(select, { key: 'ArrowDown' }); }
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('keeps the popup inside the dialog focus boundary and Escape closes only the dropdown', () => {
    const { container } = render(<div role="dialog"><Controlled /></div>);
    const dialog = container.querySelector('[role="dialog"]')!;
    const close = vi.fn(); dialog.addEventListener('keydown', close);
    const select = screen.getByRole('combobox'); fireEvent.click(select);
    expect(dialog).toContainElement(screen.getByRole('listbox'));
    fireEvent.keyDown(select, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument(); expect(close).not.toHaveBeenCalled();
    expect(select).toHaveFocus();
  });
  it('closes on Tab, blur or outside click without changing a value', () => {
    const change = vi.fn(); render(<Controlled change={change} />); const select = screen.getByRole('combobox');
    fireEvent.click(select); fireEvent.keyDown(select, { key: 'Tab' }); expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(select); fireEvent.blur(select); expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(select); fireEvent.mouseDown(document.body); expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
  });
  it('cannot choose an option removed or disabled while the menu is open', () => {
    const change = vi.fn(); const { rerender } = render(<FormSelect value="" onChange={change}>{options}</FormSelect>);
    fireEvent.click(screen.getByRole('combobox'));
    rerender(<FormSelect value="" onChange={change}><option value="">Select a category</option><option value="plumbing" disabled>Plumbing</option></FormSelect>);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plumbing' }));
    expect(change).not.toHaveBeenCalled();
  });
});
