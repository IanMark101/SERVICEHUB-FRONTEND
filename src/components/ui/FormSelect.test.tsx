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

function Searchable({ change = vi.fn(), initial = '' }: { change?: (value: string) => void; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <form aria-label="Category form">
    <label htmlFor="searchable-category">Service category</label>
    <FormSelect id="searchable-category" name="category" required searchable searchLabel="Search service categories" searchTerms={{ aircon: 'Cooling split-type AC maintenance' }} value={value} onChange={event => { change(event.target.value); setValue(event.target.value); }}>{options}</FormSelect>
    <button type="button">Next field</button>
  </form>;
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
  it('repositions an open popup when a window resize has a non-Node event target', () => {
    render(<Controlled />);
    const select = screen.getByRole('combobox');
    const bounds = vi.spyOn(select, 'getBoundingClientRect').mockReturnValue(new DOMRect(24, 100, 240, 44));
    fireEvent.click(select);
    expect(screen.getByRole('listbox')).toHaveStyle({ left: '24px', width: '240px' });
    bounds.mockReturnValue(new DOMRect(40, 120, 200, 44));
    fireEvent(window, new Event('resize'));
    expect(screen.getByRole('listbox')).toHaveStyle({ left: '40px', width: '200px' });
    expect(select).toHaveFocus();
  });
  it('cannot choose an option removed or disabled while the menu is open', () => {
    const change = vi.fn(); const { rerender } = render(<FormSelect value="" onChange={change}>{options}</FormSelect>);
    fireEvent.click(screen.getByRole('combobox'));
    rerender(<FormSelect value="" onChange={change}><option value="">Select a category</option><option value="plumbing" disabled>Plumbing</option></FormSelect>);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plumbing' }));
    expect(change).not.toHaveBeenCalled();
  });
});

describe('searchable form select', () => {
  it('uses one editable field to browse and filter without changing the saved category until selection', () => {
    const change = vi.fn(); const { container } = render(<Searchable change={change} initial="plumbing" />);
    const input = screen.getByRole('combobox', { name: 'Service category' });
    const native = container.querySelector('select')!;
    expect(input).toHaveValue('Plumbing');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(container.querySelectorAll('input')).toHaveLength(1);
    fireEvent.click(input);
    expect(input).toHaveFocus();
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(3);
    fireEvent.change(input, { target: { value: '  SPLIT-TYPE  ' } });
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(1);
    expect(native).toHaveValue('plumbing'); expect(change).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Aircon service' }));
    expect(input).toHaveValue('Aircon service'); expect(native).toHaveValue('aircon');
    expect(change).toHaveBeenCalledExactlyOnceWith('aircon'); expect(input).toHaveFocus();
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('category')).toBe('aircon');
  });
  it('supports filtered keyboard selection and Escape restores the last category', () => {
    const change = vi.fn(); render(<Searchable change={change} initial="plumbing" />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key:'Enter' }); fireEvent.change(input, { target:{ value:'aircon' } });
    fireEvent.keyDown(input, { key:'Escape' }); expect(input).toHaveValue('Plumbing');
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(input); expect(input).toHaveValue('');
    fireEvent.change(input, { target:{ value:'cooling' } }); fireEvent.keyDown(input, { key:'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(within(screen.getByRole('listbox')).getByRole('option', { name:'Aircon service' }).id);
    fireEvent.keyDown(input, { key:'Enter' }); expect(input).toHaveValue('Aircon service');
    expect(change).toHaveBeenCalledExactlyOnceWith('aircon');
  });
  it('handles no results without submitting and keeps native required validation', () => {
    const change = vi.fn(); const { container } = render(<Searchable change={change} />);
    const submit = vi.fn(event => event.preventDefault()); screen.getByRole('form').addEventListener('submit', submit);
    const input = screen.getByRole('combobox'); const native = container.querySelector('select')!;
    expect(native.validity.valueMissing).toBe(true); fireEvent.click(input);
    fireEvent.change(input, { target:{ value:'no-such-category' } });
    expect(screen.getByRole('status')).toHaveTextContent('No matching categories');
    fireEvent.keyDown(input, { key:'Enter' }); expect(change).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled(); expect(native.validity.valueMissing).toBe(true);
    fireEvent.change(input, { target:{ value:'plumb' } }); fireEvent.keyDown(input, { key:'Enter' });
    expect(input).toHaveValue('Plumbing'); expect(native.validity.valid).toBe(true); expect(submit).not.toHaveBeenCalled();
  });
  it('closes on Tab, blur or outside click while preserving the selected ID and label', () => {
    const blur = vi.fn(); const { container } = render(<Searchable initial="plumbing" />);
    container.querySelector('select')!.addEventListener('focusout', blur);
    const input = screen.getByRole('combobox');
    fireEvent.click(input); fireEvent.keyDown(input, { key:'Tab' }); expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(input); fireEvent.blur(input, { relatedTarget:screen.getByRole('button', { name:'Next field' }) });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument(); expect(blur).toHaveBeenCalled();
    fireEvent.click(input); fireEvent.change(input, { target:{ value:'unconfirmed' } }); fireEvent.mouseDown(document.body);
    expect(input).toHaveValue('Plumbing'); expect(container.querySelector('select')).toHaveValue('plumbing');
  });
  it('keeps Escape inside the parent dialog and never opens disabled controls', () => {
    const { unmount } = render(<div role="dialog"><Searchable /></div>); const close = vi.fn();
    screen.getByRole('dialog').addEventListener('keydown', close);
    const input = screen.getByRole('combobox'); fireEvent.click(input);
    expect(screen.getByRole('dialog')).toContainElement(screen.getByRole('listbox'));
    fireEvent.keyDown(input, { key:'Escape' }); expect(close).not.toHaveBeenCalled();
    unmount();
    render(<><FormSelect searchable disabled aria-label="Disabled">{options}</FormSelect><fieldset disabled><FormSelect searchable aria-label="Restricted">{options}</FormSelect></fieldset></>);
    for (const control of screen.getAllByRole('combobox')) fireEvent.click(control);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
