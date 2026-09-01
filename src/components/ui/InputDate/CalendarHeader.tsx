'use client'
import { memo } from 'react'
import Button from '../Button'

// Komponen untuk header kalender
const CalendarHeader = memo(
  ({
    month,
    year,
    onToggleMonthSelector,
    onToggleYearSelector,
    registerMonthButtonRef,
    registerYearButtonRef,
    monthNames
  }: {
    month: number
    year: number
    onToggleMonthSelector: () => void
    onToggleYearSelector: () => void
    registerMonthButtonRef: (el: HTMLButtonElement | null) => void
    registerYearButtonRef: (el: HTMLButtonElement | null) => void
    monthNames: string[]
  }) => {
    return (
      <div className='flex flex-1 justify-start sm:justify-center mb-2'>
        <Button
          type='button'
          ref={registerMonthButtonRef}
          variant='text'
          className='text-base font-normal capitalize hover:bg-primary-main/25 rounded px-2'
          onClick={onToggleMonthSelector}
          aria-label='Pilih bulan'
          tabIndex={0}
        >
          {monthNames[month]}
        </Button>
        <Button
          type='button'
          ref={registerYearButtonRef}
          variant='text'
          className='text-base font-normal capitalize hover:bg-primary-main/25 rounded px-2'
          onClick={onToggleYearSelector}
          aria-label='Pilih tahun'
          tabIndex={0}
        >
          {year}
        </Button>
      </div>
    )
  }
)
CalendarHeader.displayName = 'CalendarHeader'

export default CalendarHeader
