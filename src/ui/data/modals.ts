export type ModalRequest =
  | { kind: 'review'; clientId?: string }
  | { kind: 'upload' }
  | { kind: 'invitePro' }
  | { kind: 'inviteTeammate' }
  | { kind: 'message'; who?: string };

export type OpenModal = (request: ModalRequest) => void;
