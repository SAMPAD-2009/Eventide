

export interface Event {
  event_id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  category?: string | null;
  datetime: string | null;
  isIndefinite?: boolean;
  user_email: string;
  label_id?: string | null;
  collab_id?: string | null;
  collaborations?: { name: string } | null;
}

export interface Project {
  project_id: string;
  user_email: string;
  name: string;
  created_at: string;
  collab_id?: string | null;
  collaborations?: { name: string } | null;
}

export type Priority = 'Very Important' | 'Important' | 'Not Important' | 'Casual';

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Todo {
  todo_id: string;
  user_email: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
  label_id?: string | null;
  subtasks?: Subtask[];
  collab_id?: string | null;
  collaborations?: { name: string } | null;
}

export interface Label {
  label_id: string;
  user_email: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Notebook {
  notebook_id: string;
  user_email: string;
  name: string;
  created_at: string;
  collab_id?: string | null;
  collaborations?: { name: string } | null;
}

export interface Note {
  note_id: string;
  notebook_id: string;
  user_email: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  collab_id?: string | null;
  collaborations?: { name: string } | null;
}

export interface Collaboration {
  collab_id: string;
  name: string;
  owner_email: string;
  created_at: string;
}

export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface CollaborationMember {
    collab_id: string;
    user_email: string;
    joined_at: string;
    role: MemberRole;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Invitation {
    invite_id: string;
    collab_id: string;
    inviter_email: string;
    invitee_email: string;
    status: InvitationStatus;
    created_at: string;
    role: MemberRole;
}

// For displaying invites with more context
export interface InvitationWithCollab extends Invitation {
    collaborations: {
        name: string;
    }
}
