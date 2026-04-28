"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/apiServices/requests";
import { tokenService } from "@/apiServices/token-service";
import { queryKeys } from "@/lib/query-keys";
import { sessionActions } from "@/stores/session-store";

export const useAppMutations = () => {
  const queryClient = useQueryClient();

  const persistSession = (token: string, user: Parameters<typeof sessionActions.setCurrentUser>[0]) => {
    tokenService.setToken(token);
    sessionActions.clearSessionFlag();
    sessionActions.setCurrentUser(user);
    queryClient.setQueryData(queryKeys.auth.me, user ? { ...user, role: user.role === "admin" ? "admin" : "organizer" } : user);
  };

  const register = useMutation({
    mutationFn: request.register,
    onSuccess: ({ data }) => {
      persistSession(data.token, data.user);
    }
  });

  const login = useMutation({
    mutationFn: request.login,
    onSuccess: ({ data }) => {
      persistSession(data.token, data.user);
    }
  });

  const googleCallback = useMutation({
    mutationFn: request.googleCallback,
    onSuccess: ({ data }) => {
      persistSession(data.token, data.user);
    }
  });

  const googleInitiate = useMutation({
    mutationFn: request.googleInitiate
  });

  const logout = () => {
    tokenService.removeToken();
    sessionActions.logout();
    queryClient.clear();
  };

  const createEvent = useMutation({
    mutationFn: request.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, payload }: Parameters<typeof request.updateEvent>[0] extends never
      ? never
      : { id: string; payload: Parameters<typeof request.updateEvent>[1] }) =>
      request.updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: request.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  const initializeCheckout = useMutation({
    mutationFn: request.initializeCheckout
  });

  const verifyCheckout = useMutation({
    mutationFn: request.verifyCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.mine });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  const upsertPayoutProfile = useMutation({
    mutationFn: request.upsertPayoutProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.payoutStatus });
    }
  });

  const updateOrganizerSettings = useMutation({
    mutationFn: request.updateOrganizerSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.payoutStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.settings });
    }
  });

  const createRefund = useMutation({
    mutationFn: request.createRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
  });

  const createEventPost = useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: { guestName?: string; content: string } }) =>
      request.createEventPost(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  });

  const uploadImage = useMutation({
    mutationFn: request.createEvent
  });

  const generateBrandingAssetMetadata = useMutation({
    mutationFn: request.generateBrandingAssetMetadata,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.branding });
    }
  });

  const checkInTicket = useMutation({
    mutationFn: request.checkInTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  const inviteEventCollaborator = useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: { email: string; role: "manager" | "scanner" | "viewer" } }) =>
      request.inviteEventCollaborator(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.collaborators(variables.eventId) });
    }
  });

  const acceptEventInvitation = useMutation({
    mutationFn: request.acceptEventInvitation
  });

  const scanEventTicket = useMutation({
    mutationFn: ({ eventId, qrToken }: { eventId: string; qrToken: string }) => request.scanEventTicket(eventId, { qrToken })
  });

  const checkInEventTicket = useMutation({
    mutationFn: ({ eventId, qrToken }: { eventId: string; qrToken: string }) => request.checkInEventTicket(eventId, { qrToken }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.metrics(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.event(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.organizer });
    }
  });

  return {
    register,
    login,
    googleInitiate,
    googleCallback,
    logout,
    createEvent,
    updateEvent,
    deleteEvent,
    initializeCheckout,
    verifyCheckout,
    upsertPayoutProfile,
    updateOrganizerSettings,
    createRefund,
    createEventPost,
    uploadImage,
    generateBrandingAssetMetadata,
    checkInTicket,
    inviteEventCollaborator,
    acceptEventInvitation,
    scanEventTicket,
    checkInEventTicket
  };
};
