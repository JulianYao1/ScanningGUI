// tests/component/BoxSetupForm.test.ts
// Component tests for BoxSetupForm

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BoxSetupForm from '~/components/BoxSetupForm.vue'
import { BoxStyle } from '~/types/scanning'

describe('BoxSetupForm', () => {
  it('should render the form', () => {
    const wrapper = mount(BoxSetupForm)
    expect(wrapper.find('h2').text()).toBe('Start New Scanning Session')
  })

  it('should render box number input', () => {
    const wrapper = mount(BoxSetupForm)
    const input = wrapper.find('[data-testid="box-number"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('text')
  })

  it('should render box style select', () => {
    const wrapper = mount(BoxSetupForm)
    const select = wrapper.find('[data-testid="box-style"]')
    expect(select.exists()).toBe(true)
  })

  it('should have all box style options', () => {
    const wrapper = mount(BoxSetupForm)
    const select = wrapper.find('[data-testid="box-style"]')
    const options = select.findAll('option')

    const optionTexts = options.map(o => o.text())
    expect(optionTexts).toContain('Envelope')
    expect(optionTexts).toContain('Small Box')
    expect(optionTexts).toContain('Medium Box')
    expect(optionTexts).toContain('Large Box')
    expect(optionTexts).toContain('Flat Rate')
    expect(optionTexts).toContain('Tube')
  })

  it('should disable submit button when form is empty', () => {
    const wrapper = mount(BoxSetupForm)
    const button = wrapper.find('[data-testid="start-session"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable submit button when form is filled', async () => {
    const wrapper = mount(BoxSetupForm)

    await wrapper.find('[data-testid="box-number"]').setValue('BOX-001')
    await wrapper.find('[data-testid="box-style"]').setValue('Small Box')

    const button = wrapper.find('[data-testid="start-session"]')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should emit start-session event on submit', async () => {
    const wrapper = mount(BoxSetupForm)

    await wrapper.find('[data-testid="box-number"]').setValue('BOX-001')
    await wrapper.find('[data-testid="box-style"]').setValue('Small Box')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('start-session')).toBeTruthy()
    expect(wrapper.emitted('start-session')?.[0]).toEqual(['BOX-001', 'Small Box'])
  })

  it('should reset form after submission', async () => {
    const wrapper = mount(BoxSetupForm)

    await wrapper.find('[data-testid="box-number"]').setValue('BOX-001')
    await wrapper.find('[data-testid="box-style"]').setValue('Small Box')

    await wrapper.find('form').trigger('submit')

    // Check inputs are cleared
    const boxNumberInput = wrapper.find('[data-testid="box-number"]') as any
    const boxStyleSelect = wrapper.find('[data-testid="box-style"]') as any

    expect(boxNumberInput.element.value).toBe('')
    expect(boxStyleSelect.element.value).toBe('')
  })

  it('should not submit when box number is empty', async () => {
    const wrapper = mount(BoxSetupForm)

    await wrapper.find('[data-testid="box-style"]').setValue('Small Box')

    const button = wrapper.find('[data-testid="start-session"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should not submit when box style is empty', async () => {
    const wrapper = mount(BoxSetupForm)

    await wrapper.find('[data-testid="box-number"]').setValue('BOX-001')

    const button = wrapper.find('[data-testid="start-session"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should disable form when disabled prop is true', async () => {
    const wrapper = mount(BoxSetupForm, {
      props: {
        disabled: true
      }
    })

    const boxNumberInput = wrapper.find('[data-testid="box-number"]')
    const boxStyleSelect = wrapper.find('[data-testid="box-style"]')
    const button = wrapper.find('[data-testid="start-session"]')

    expect(boxNumberInput.attributes('disabled')).toBeDefined()
    expect(boxStyleSelect.attributes('disabled')).toBeDefined()
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should accept box number with various formats', async () => {
    const wrapper = mount(BoxSetupForm)

    const testCases = ['BOX-001', 'BOX001', '001', 'SHELF-A-BOX-123']

    for (const boxNumber of testCases) {
      await wrapper.find('[data-testid="box-number"]').setValue(boxNumber)
      await wrapper.find('[data-testid="box-style"]').setValue('Small Box')

      await wrapper.find('form').trigger('submit')

      const emitted = wrapper.emitted('start-session') as any[]
      expect(emitted[emitted.length - 1][0]).toBe(boxNumber)
    }
  })

  it('should have required attribute on inputs', () => {
    const wrapper = mount(BoxSetupForm)

    const boxNumberInput = wrapper.find('[data-testid="box-number"]')
    const boxStyleSelect = wrapper.find('[data-testid="box-style"]')

    expect(boxNumberInput.attributes('required')).toBeDefined()
    expect(boxStyleSelect.attributes('required')).toBeDefined()
  })

  it('should have placeholder text on box number input', () => {
    const wrapper = mount(BoxSetupForm)

    const boxNumberInput = wrapper.find('[data-testid="box-number"]')
    expect(boxNumberInput.attributes('placeholder')).toBe('Enter box number')
  })
})
