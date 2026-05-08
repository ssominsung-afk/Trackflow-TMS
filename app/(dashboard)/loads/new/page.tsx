import { redirect } from 'next/navigation'

// /loads/new → reuse the edit form with id='new'
export default function NewLoadPage() {
  redirect('/loads/new/edit')
}
