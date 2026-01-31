import { Recipe } from '@/payload-types'

export const handlePublishedDate = ({ siblingData, value }: { siblingData: Partial<Recipe>; value?: string | null | undefined }) => {
    // Always set current date when status is published
    if (siblingData._status === 'published') {
        return new Date()
    }
    return value
}
