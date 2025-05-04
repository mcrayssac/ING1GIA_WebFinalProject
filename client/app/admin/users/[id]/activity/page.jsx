import UserActivityDetail from "./UserActivityDetail"

// Server Component
export default async function UserActivityPage({ params }) {
    return <UserActivityDetail userId={params.id} />
}
