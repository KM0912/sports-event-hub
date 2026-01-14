'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LEVELS, MIYAGI_CITIES, LevelKey } from '@/lib/constants'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, JapaneseYen, FileText, AlertCircle } from 'lucide-react'

type EventFormData = {
  title: string
  start_at: string
  end_at: string
  venue_name: string
  address: string
  city: string
  level: LevelKey
  fee: number
  visitor_capacity: number
  description: string
  participation_rules: string
  equipment: string
  notes: string
  application_deadline: string
}

type EventFormProps = {
  initialData?: EventFormData & { id?: string }
  mode: 'create' | 'edit'
}

const defaultFormData: EventFormData = {
  title: '',
  start_at: '',
  end_at: '',
  venue_name: '',
  address: '',
  city: '',
  level: 'all',
  fee: 500,
  visitor_capacity: 2,
  description: '',
  participation_rules: '',
  equipment: '',
  notes: '',
  application_deadline: '',
}

export function EventForm({ initialData, mode }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(initialData || defaultFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'visitor_capacity' ? Number(value) : value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {}

    if (!formData.title.trim()) newErrors.title = 'タイトルを入力してください'
    if (!formData.start_at) newErrors.start_at = '開始日時を入力してください'
    if (!formData.end_at) newErrors.end_at = '終了日時を入力してください'
    if (formData.start_at && formData.end_at && formData.start_at >= formData.end_at) {
      newErrors.end_at = '終了日時は開始日時より後にしてください'
    }
    if (!formData.venue_name.trim()) newErrors.venue_name = '体育館名を入力してください'
    if (!formData.address.trim()) newErrors.address = '住所を入力してください'
    if (!formData.city) newErrors.city = '市区町村を選択してください'
    if (formData.fee < 0) newErrors.fee = '参加費は0円以上で入力してください'
    if (formData.visitor_capacity < 1) newErrors.visitor_capacity = 'ビジター枠は1人以上で入力してください'
    if (!formData.description.trim()) newErrors.description = '説明を入力してください'
    if (!formData.participation_rules.trim()) newErrors.participation_rules = '参加条件を入力してください'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const eventData = {
      host_user_id: user.id,
      title: formData.title.trim(),
      start_at: formData.start_at,
      end_at: formData.end_at,
      chat_expires_at: new Date(new Date(formData.end_at).getTime() + 48 * 60 * 60 * 1000).toISOString(),
      venue_name: formData.venue_name.trim(),
      address: formData.address.trim(),
      city: formData.city,
      level: formData.level,
      fee: formData.fee,
      visitor_capacity: formData.visitor_capacity,
      description: formData.description.trim(),
      participation_rules: formData.participation_rules.trim(),
      equipment: formData.equipment.trim() || null,
      notes: formData.notes.trim() || null,
      application_deadline: formData.application_deadline || null,
    }

    if (mode === 'create') {
      const { error } = await supabase.from('events').insert(eventData)
      if (error) {
        console.error('Error creating event:', error)
        setLoading(false)
        return
      }
    } else if (initialData?.id) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', initialData.id)
      if (error) {
        console.error('Error updating event:', error)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          基本情報
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-error">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="例：初心者歓迎！日曜日のゆるバド練習会"
              className={`input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <p className="text-sm text-error mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_at" className="block text-sm font-medium text-gray-700 mb-1">
                開始日時 <span className="text-error">*</span>
              </label>
              <input
                id="start_at"
                name="start_at"
                type="datetime-local"
                value={formData.start_at ? format(new Date(formData.start_at), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleChange}
                className={`input ${errors.start_at ? 'input-error' : ''}`}
              />
              {errors.start_at && <p className="text-sm text-error mt-1">{errors.start_at}</p>}
            </div>
            <div>
              <label htmlFor="end_at" className="block text-sm font-medium text-gray-700 mb-1">
                終了日時 <span className="text-error">*</span>
              </label>
              <input
                id="end_at"
                name="end_at"
                type="datetime-local"
                value={formData.end_at ? format(new Date(formData.end_at), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={handleChange}
                className={`input ${errors.end_at ? 'input-error' : ''}`}
              />
              {errors.end_at && <p className="text-sm text-error mt-1">{errors.end_at}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 mb-1">
              募集締切（任意）
            </label>
            <input
              id="application_deadline"
              name="application_deadline"
              type="datetime-local"
              value={formData.application_deadline ? format(new Date(formData.application_deadline), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          場所
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
              体育館名 <span className="text-error">*</span>
            </label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="例：宮城野体育館"
              className={`input ${errors.venue_name ? 'input-error' : ''}`}
            />
            {errors.venue_name && <p className="text-sm text-error mt-1">{errors.venue_name}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              市区町村 <span className="text-error">*</span>
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`input ${errors.city ? 'input-error' : ''}`}
            >
              <option value="">選択してください</option>
              {MIYAGI_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <p className="text-sm text-error mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              住所 <span className="text-error">*</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="例：仙台市宮城野区新田東4丁目1-1"
              className={`input ${errors.address ? 'input-error' : ''}`}
            />
            {errors.address && <p className="text-sm text-error mt-1">{errors.address}</p>}
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          練習会詳細
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                レベル <span className="text-error">*</span>
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input"
              >
                {Object.entries(LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
                参加費 <span className="text-error">*</span>
              </label>
              <div className="relative">
                <JapaneseYen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="fee"
                  name="fee"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.fee}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.fee ? 'input-error' : ''}`}
                />
              </div>
              {errors.fee && <p className="text-sm text-error mt-1">{errors.fee}</p>}
            </div>
            <div>
              <label htmlFor="visitor_capacity" className="block text-sm font-medium text-gray-700 mb-1">
                ビジター枠 <span className="text-error">*</span>
              </label>
              <input
                id="visitor_capacity"
                name="visitor_capacity"
                type="number"
                min="1"
                value={formData.visitor_capacity}
                onChange={handleChange}
                className={`input ${errors.visitor_capacity ? 'input-error' : ''}`}
              />
              {errors.visitor_capacity && <p className="text-sm text-error mt-1">{errors.visitor_capacity}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明 <span className="text-error">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="練習会の内容、雰囲気などを記載してください"
              className={`input resize-none ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="participation_rules" className="block text-sm font-medium text-gray-700 mb-1">
              参加条件 <span className="text-error">*</span>
            </label>
            <textarea
              id="participation_rules"
              name="participation_rules"
              value={formData.participation_rules}
              onChange={handleChange}
              rows={3}
              placeholder="例：ラケット持参、室内シューズ必須、初心者歓迎"
              className={`input resize-none ${errors.participation_rules ? 'input-error' : ''}`}
            />
            {errors.participation_rules && <p className="text-sm text-error mt-1">{errors.participation_rules}</p>}
          </div>

          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">
              持ち物（任意）
            </label>
            <textarea
              id="equipment"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              rows={2}
              placeholder="例：ラケット、室内シューズ、飲み物、タオル"
              className="input resize-none"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              注意事項（任意）
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="例：駐車場は台数に限りがあります"
              className="input resize-none"
            />
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">ご確認ください</p>
          <p className="mt-1">
            公開後は一覧ページに表示され、誰でも閲覧できるようになります。
            個人情報等の記載にはご注意ください。
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          <Calendar className="w-4 h-4" />
          {loading ? '処理中...' : mode === 'create' ? '練習会を作成' : '変更を保存'}
        </button>
      </div>
    </form>
  )
}
