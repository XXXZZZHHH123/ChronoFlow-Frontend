import {
  allowedActions,
  TaskActionEnum,
  type AllowAction,
} from "@/services/eventTask";
import { z } from "zod";

//Login
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

//Registeration
export const organizerRegistrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .min(6, "Invalid username")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only letters, numbers, dot, underscore, hyphen"
    ),
  user_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
  user_email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"),
  user_mobile: z
    .string()
    .trim()
    .regex(/^(?:\+65|0065)?[89]\d{7}$/, "Invalid Singapore mobile number"),
  organisation_name: z.string().trim().min(1, "Organisation name is required"),
  organisation_address: z.string().max(255).optional(),
});

export type OrganizerRegistration = z.infer<typeof organizerRegistrationSchema>;

export const memberLookupSchema = z.object({
  organisation_id: z.string().trim().min(1, "Organisation ID is required"),
  user_id: z.string().trim().min(1, "User ID is required"),
});

export type MemberLookup = z.infer<typeof memberLookupSchema>;

export type MemberPrefill = {
  organization_name: string;
  email: string;
};

export const MemberPrefillResponseSchema = z.object({
  organizationName: z.string().trim().min(1, "Organization name is required"),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"),
});

export type MemberPrefillResponse = z.infer<typeof MemberPrefillResponseSchema>;

export const memberCompleteRegistrationSchema = z.object({
  user_id: z.string().trim().min(1, "User ID is required"),
  user_name: z
    .string()
    .trim()
    .min(6, "Username must be at least 6 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only letters, numbers, dot, underscore, hyphen"
    ),
  user_password: z.string().min(8, "Password must be at least 8 characters"),
  user_mobile: z
    .string()
    .trim()
    .regex(/^(?:\+65|0065)?[89]\d{7}$/, "Invalid Singapore mobile number"),
});

export type MemberCompleteRegistration = z.infer<
  typeof memberCompleteRegistrationSchema
>;

//Member
export const MemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.email("Invalid email"),
  phone: z.string().nullable(),
  roles: z.array(z.string()),
  registered: z.boolean(),
});
export type Member = z.infer<typeof MemberSchema>;

export const MembersResponseSchema = z.array(MemberSchema);
export type MembersResponse = z.infer<typeof MembersResponseSchema>;

const MemberDashboardEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  organizerId: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  status: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable().optional(),
  remark: z.string().nullable().optional(),
});
export type MemberDashboardEvent = z.infer<typeof MemberDashboardEventSchema>;

const MemberDashboardAssignmentGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventId: z.string(),
  leadUserId: z.string().nullable().optional(),
  leadUserName: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
});
export type MemberDashboardAssignmentGroup = z.infer<
  typeof MemberDashboardAssignmentGroupSchema
>;

const MemberDashboardAssignedUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  groups: z.array(MemberDashboardAssignmentGroupSchema).optional().default([]),
});
export type MemberDashboardAssignedUser = z.infer<
  typeof MemberDashboardAssignedUserSchema
>;

const MemberDashboardGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  sort: z.number().int().default(0),
  leadUserId: z.string().nullable().optional(),
  leadUserName: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
  status: z.number().int(),
  event: MemberDashboardEventSchema,
});
export type MemberDashboardGroup = z.infer<typeof MemberDashboardGroupSchema>;

const MemberDashboardTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.number().int(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable().optional(),
  remark: z.string().nullable().optional(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
  assignedUser: MemberDashboardAssignedUserSchema.nullable().optional(),
  event: MemberDashboardEventSchema,
});
export type MemberDashboardTask = z.infer<typeof MemberDashboardTaskSchema>;

const MemberDashboardMemberSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().nullable().optional(),
  status: z.number().int(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
});
export type MemberDashboardMember = z.infer<typeof MemberDashboardMemberSchema>;

export const MemberDashboardSchema = z.object({
  member: MemberDashboardMemberSchema,
  groups: z.array(MemberDashboardGroupSchema).default([]),
  tasks: z.array(MemberDashboardTaskSchema).default([]),
});
export type MemberDashboard = z.infer<typeof MemberDashboardSchema>;

export const MemberConfigSchema = z.object({
  email: z.email("Invalid email"),
  roleIds: z.array(z.string()).nonempty("At least one role is required"),
  remark: z.string().trim().optional(),
});
export type MemberConfig = z.infer<typeof MemberConfigSchema>;

//events
export const OrgEventSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    status: z.number().int(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date().nullable().optional(),
    remark: z.string().nullable().optional(),
    joiningParticipants: z.number().int().nonnegative().default(0),
    groups: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
        })
      )
      .optional()
      .default([]),
    taskStatus: z.object({
      total: z.number().int().nonnegative(),
      remaining: z.number().int().nonnegative(),
      completed: z.number().int().nonnegative(),
    }),
  })
  .refine(
    (data) =>
      data.endTime == null ||
      data.endTime.getTime() >= data.startTime.getTime(),
    {
      message: "End time cannot be earlier than start time",
      path: ["endTime"],
    }
  );

export type OrgEvent = z.infer<typeof OrgEventSchema>;
export const OrgEventsResponseSchema = z.array(OrgEventSchema);

export const EventConfigSchema = z
  .object({
    name: z.string().trim().min(1, "Event name is required"),
    description: z.string().trim().optional().nullable(),
    location: z.string().trim().min(1, "Location is required"),
    startTime: z.date(),
    endTime: z.date(),
    remark: z.string().trim().optional().nullable(),
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    if (endTime.getTime() < startTime.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time cannot be earlier than start time",
      });
    }
  });

export type EventConfig = z.infer<typeof EventConfigSchema>;

// Group Member
export const GroupMemberSchema = z.object({
  userId: z.string(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  roleId: z.string().nullable(),
  roleName: z.string().nullable(),
  joinTime: z.coerce.date().nullable(),
});
export type GroupMember = z.infer<typeof GroupMemberSchema>;

// Group
export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  sort: z.number().int().default(0),
  leadUserId: z.string().nullable(),
  leadUserName: z.string().nullable(),
  remark: z.string().nullable(),
  status: z.number().int(),
  statusName: z.string().nullable(),
  eventId: z.string(),
  eventName: z.string().nullable(),
  memberCount: z.number().int().default(0),
  members: z.array(GroupMemberSchema).optional(),
  createTime: z.coerce.date(),
  updateTime: z.coerce.date(),
});
export type Group = z.infer<typeof GroupSchema>;

// Create Group Config
export const CreateGroupConfigSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
  eventId: z.string(),
  leadUserId: z.string().min(1, "Lead user is required"),
  remark: z.string().trim().optional().nullable(),
  sort: z.number().int().min(0, "Sort order must be 0 or greater").default(0),
});
export type CreateGroupConfig = z.infer<typeof CreateGroupConfigSchema>;

// Update Group Config
export const GroupConfigSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
  leadUserId: z.string().optional().nullable(),
  remark: z.string().trim().optional().nullable(),
  sort: z.number().int().min(0, "Sort order must be 0 or greater").default(0),
  status: z.number().int().optional(),
});
export type GroupConfig = z.infer<typeof GroupConfigSchema>;

//Roles
export const rolePermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
});
export type RolePermission = z.infer<typeof rolePermissionSchema>;

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean().default(false),
  key: z.string(),
  permissions: z.array(rolePermissionSchema).nullable(),
});
export type Role = z.infer<typeof roleSchema>;
export const roleResponseSchema = z.array(roleSchema);

export const roleAssignSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
  roles: z
    .array(z.string().trim().min(1, "Role ID is required"))
    .min(1, "At least one role must be assigned"),
});

export type RoleAssign = z.infer<typeof roleAssignSchema>;

export const roleConfigSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  key: z.string().trim().min(1, "Role key is required"),
  permissions: z.array(z.string()).nullable(),
});

export type RoleConfig = z.infer<typeof roleConfigSchema>;

//Permissions
export const permissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  description: z.string().optional().nullable(),
});
export type Permission = z.infer<typeof permissionSchema>;
export const permissionResponseSchema = z.array(permissionSchema);
export type PermissionListResponse = z.infer<typeof permissionResponseSchema>;

export const permissionConfigSchema = z.object({
  name: z.string().trim().min(1, "Permission name is required"),
  key: z.string().trim().min(1, "Permission key is required"),
  description: z.string().trim().optional(),
});

export type PermissionConfig = z.infer<typeof permissionConfigSchema>;

//Event Task
export const eventTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.number().int(), // backend currently returns 0..?
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  createTime: z.string().nullable(),
  updateTime: z.string().nullable(),
  remark: z.string().nullable(),
  assignerUser: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    groups: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .nullable(),
  }),
  assignedUser: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    groups: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .nullable(),
  }),
});

export const eventTaskListSchema = z.array(eventTaskSchema);
export type EventTask = z.infer<typeof eventTaskSchema>;

// event task create config
export const eventTaskCreateConfigSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Task name is required"),
    description: z.string().trim().optional().nullable(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    remark: z.string().trim().optional().nullable(),
    targetUserId: z.string().min(1, "Assigned user is required"),
    files: z
      .array(
        z.instanceof(File, {
          message: "Each item must be a valid file",
        })
      )
      .optional(),
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    if (startTime && endTime && endTime.getTime() < startTime.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time cannot be earlier than start time",
      });
    }
  });

export type EventTaskCreateConfig = z.infer<typeof eventTaskCreateConfigSchema>;

// General event task update config (for different update actions)
export const eventTaskConfigSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional().nullable(),
    type: z
      .union(
        allowedActions.map((a) => z.literal(a)) as [
          z.ZodLiteral<AllowAction>,
          ...z.ZodLiteral<AllowAction>[]
        ]
      )
      .optional()
      .describe("Task action type (only valid update actions allowed)"),
    targetUserId: z.string().optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    remark: z.string().trim().optional().nullable(),
    files: z
      .array(z.instanceof(File, { message: "Each item must be a valid file" }))
      .optional(),
  })
  .superRefine(({ startTime, endTime }, ctx) => {
    if (startTime && endTime && endTime.getTime() < startTime.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time cannot be earlier than start time",
      });
    }
  });

export type EventTaskConfig = z.infer<typeof eventTaskConfigSchema>;

//Base event task action schema
/** Base (remark + files) reused by many actions */
export const baseActionSchema = z.object({
  remark: z.string().trim().optional().nullable(),
  files: z
    .array(z.instanceof(File, { message: "Each item must be a valid file" }))
    .optional(),
});
export type BaseActionSchemaType = z.infer<typeof baseActionSchema>;

/** Reassign = base + targetUserId */
export const reAssignSchema = baseActionSchema.extend({
  targetUserId: z.string().min(1, "Please select a member"),
});
export type ReAssignFormType = z.infer<typeof reAssignSchema>;

//Assignable members for event tasks
export const assignableMemberSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const eventGroupWithAssignableMembersSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(assignableMemberSchema),
});

export const assignableMembersResponseSchema = z.array(
  eventGroupWithAssignableMembersSchema
);

export type AssignableMember = z.infer<typeof assignableMemberSchema>;
export type EventGroupWithAssignableMembers = z.infer<
  typeof eventGroupWithAssignableMembersSchema
>;

//Event task log
/** Back-end returns LocalDateTime without timezone (e.g. 2025-10-11T02:49:04) */
const localDateTimeString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Invalid LocalDateTime");

/** FileResult */
export const fileResultSchema = z.object({
  objectName: z.string(),
  name: z.string().nullable().optional(),
  contentType: z.string(),
  size: z.string(),
  signedUrl: z.string(),
});

export const taskLogUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
});

/** TaskLogResponse */
export const taskLogSchema = z.object({
  id: z.string(),
  action: z.enum(TaskActionEnum),
  targetUser: taskLogUserSchema.nullable().optional(),
  sourceUser: taskLogUserSchema.nullable().optional(),
  createTime: localDateTimeString,
  remark: z.string().nullable().optional(),
  fileResults: z.array(fileResultSchema).optional().default([]),
});

/** Response wrapper*/
export const taskLogResponseSchema = z.array(taskLogSchema);

export type FileResult = z.infer<typeof fileResultSchema>;
export type TaskLogUser = z.infer<typeof taskLogUserSchema>;
export type TaskLog = z.infer<typeof taskLogSchema>;
export type TaskLogListResponse = z.infer<typeof taskLogResponseSchema>;

//Attendees
export const attendeeSchema = z.object({
  id: z.string(),
  attendeeEmail: z.email("Invalid email"),
  attendeeName: z.string().trim().min(1, "Name is required"),
  attendeeMobile: z
    .string()
    .trim()
    .regex(/^(?:\+65|0065)?[89]\d{7}$/, "Invalid Singapore mobile number"),
  checkInToken: z.string(),
  qrCodeBase64: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
  checkInStatus: z.union([z.literal(0), z.literal(1)]),
});

export const attendeesResponseSchema = z.array(attendeeSchema);
export type Attendee = z.infer<typeof attendeeSchema>;

//Indi attendee config
export const IndiAttendeeConfigSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"),
  name: z.string().trim().min(1, "Name is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^(?:\+65|0065)?[89]\d{7}$/, "Invalid Singapore mobile number"),
});

export type IndiAttendeeConfig = z.infer<typeof IndiAttendeeConfigSchema>;

//Attendee config
export const AttendeeConfigSchema = z.object({
  eventId: z.string().trim().min(1, "Event ID is required"),
  attendees: z
    .array(IndiAttendeeConfigSchema)
    .min(1, "At least one attendee is required"),
  qrSize: z.number().int().positive().optional().default(400),
});

export type AttendeeConfig = z.infer<typeof AttendeeConfigSchema>;
