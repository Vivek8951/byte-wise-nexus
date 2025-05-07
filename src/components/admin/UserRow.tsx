
import { formatDistance } from 'date-fns';
import { User } from '@/types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserRowProps {
  user: User;
  onSelect: () => void;
}

export function UserRow({ user, onSelect }: UserRowProps) {
  // Format the joined date (assuming created_at exists but is not in the type)
  const joinedDate = (user as any).created_at 
    ? formatDistance(new Date((user as any).created_at), new Date(), { addSuffix: true })
    : 'Unknown';

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'instructor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'student':
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.avatar ? (
          <div className="flex items-center">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-8 w-8 rounded-full mr-2" 
            />
            {user.name}
          </div>
        ) : (
          user.name
        )}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge className={getRoleBadgeColor(user.role)}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>{user.enrolledCourses?.length || 0} courses</TableCell>
      <TableCell>{joinedDate}</TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={onSelect}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
