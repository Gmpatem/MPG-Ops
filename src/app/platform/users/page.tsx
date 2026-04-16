import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllUsers, toggleUserPlatformAdmin } from '@/app/actions/platform';

export default async function PlatformUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage user accounts and platform admin access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Admin</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.full_name || '-'}</td>
                    <td className="px-4 py-3">
                      {u.is_platform_admin ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async () => {
                          'use server';
                          await toggleUserPlatformAdmin(u.id, !u.is_platform_admin);
                        }}
                      >
                        <Button type="submit" size="sm" variant={u.is_platform_admin ? 'destructive' : 'outline'}>
                          {u.is_platform_admin ? 'Revoke Admin' : 'Make Admin'}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
