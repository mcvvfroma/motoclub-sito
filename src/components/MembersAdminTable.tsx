'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, PlusCircle } from 'lucide-react';

const initialMembers = [
  { id: 1, name: "Mario Rossi", email: "mario.rossi@example.com", role: "Admin" },
  { id: 2, name: "Luigi Bianchi", email: "luigi.bianchi@example.com", role: "Socio" },
  { id: 3, name: "Paola Verdi", email: "paola.verdi@example.com", role: "Socio" },
  { id: 4, name: "Giuseppe Neri", email: "giuseppe.neri@example.com", role: "Socio" },
  { id: 5, name: "Anna Gialli", email: "anna.gialli@example.com", role: "Socio" },
];

export default function MembersAdminTable() {
  const [members, setMembers] = useState(initialMembers);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setEditedData(member);
  };

  const handleSave = (id: number) => {
    setMembers(members.map(m => m.id === id ? editedData : m));
    setEditingId(null);
    setEditedData({});
  };

  const handleDelete = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };
  
  const handleAddNew = () => {
    const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
    const newMember = { id: newId, name: '', email: '', role: 'Socio' };
    setMembers([...members, newMember]);
    handleEdit(newMember);
  };

  return (
    <div className="w-full bg-card p-4 rounded-lg shadow-md">
       <h2 className="text-xl font-bold mb-4">Gestione Anagrafica Soci</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome e Cognome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {editingId === member.id ? (
                  <Input name="name" value={editedData.name} onChange={handleInputChange} />
                ) : (
                  member.name
                )}
              </TableCell>
              <TableCell>
                {editingId === member.id ? (
                  <Input type="email" name="email" value={editedData.email} onChange={handleInputChange} />
                ) : (
                  member.email
                )}
              </TableCell>
              <TableCell>
                {editingId === member.id ? (
                   <Input name="role" value={editedData.role} onChange={handleInputChange} />
                ) : (
                   member.role
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {editingId === member.id ? (
                  <Button variant="outline" size="icon" onClick={() => handleSave(member.id)}><Save className="h-4 w-4" /></Button>
                ) : (
                  <Button variant="outline" size="icon" onClick={() => handleEdit(member)}><Edit className="h-4 w-4" /></Button>
                )}
                <Button variant="destructive" size="icon" onClick={() => handleDelete(member.id)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-start">
        <Button onClick={handleAddNew}><PlusCircle className="h-4 w-4 mr-2"/> Aggiungi Socio</Button>
      </div>
    </div>
  );
}
