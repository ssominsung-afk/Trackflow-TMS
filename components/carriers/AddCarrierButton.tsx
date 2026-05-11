'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddCarrierModal from './AddCarrierModal'

export default function AddCarrierButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-sm"
      >
        <Plus size={15} />
        Add Carrier
      </button>

      <AddCarrierModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
