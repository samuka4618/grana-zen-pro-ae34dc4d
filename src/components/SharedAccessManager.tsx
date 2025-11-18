import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useSharedAccessStore, SharePermission } from '@/hooks/useSharedAccessStore';

const permissionLabels: Record<SharePermission, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

const permissionDescriptions: Record<SharePermission, string> = {
  owner: 'Controle total sobre todos os dados',
  admin: 'Pode gerenciar, editar e excluir dados',
  editor: 'Pode adicionar e editar dados',
  viewer: 'Apenas visualizar dados',
};

const permissionColors: Record<SharePermission, string> = {
  owner: 'bg-purple-500',
  admin: 'bg-red-500',
  editor: 'bg-blue-500',
  viewer: 'bg-green-500',
};

export const SharedAccessManager = () => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('viewer');
  const { sharedAccess, sharedWith, loading, fetchSharedAccess, fetchSharedWith, inviteUser, updatePermission, removeAccess } = useSharedAccessStore();

  useEffect(() => {
    fetchSharedAccess();
    fetchSharedWith();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    await inviteUser(email, permission);
    setEmail('');
    setPermission('viewer');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Usuário
          </CardTitle>
          <CardDescription>
            Compartilhe suas finanças com familiares e dê a eles diferentes níveis de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission">Nível de Permissão</Label>
              <Select value={permission} onValueChange={(value) => setPermission(value as SharePermission)}>
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(permissionLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {permissionDescriptions[value as SharePermission]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>{permissionLabels[permission]}:</strong> {permissionDescriptions[permission]}
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Enviar Convite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários com Acesso
          </CardTitle>
          <CardDescription>
            Gerencie quem tem acesso às suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Carregando...</p>
          ) : sharedAccess.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum usuário com acesso ainda
            </p>
          ) : (
            <div className="space-y-3">
              {sharedAccess.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">Usuário #{access.user_id.slice(0, 8)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={permissionColors[access.permission]}>
                        {permissionLabels[access.permission]}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={access.permission}
                      onValueChange={(value) => updatePermission(access.id, value as SharePermission)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(permissionLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAccess(access.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {sharedWith.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compartilhado Comigo
            </CardTitle>
            <CardDescription>
              Finanças de outras pessoas que foram compartilhadas com você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedWith.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Usuário #{access.shared_by.slice(0, 8)}</p>
                    <Badge className={permissionColors[access.permission]}>
                      {permissionLabels[access.permission]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
