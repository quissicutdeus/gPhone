CREATE TABLE IF NOT EXISTS `gphone_contacts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `firstname` varchar(50) NOT NULL,
    `lastname` varchar(50) DEFAULT NULL,
    `phone` varchar(20) NOT NULL,
    `email` varchar(100) DEFAULT NULL,
    `avatar` MEDIUMBLOB DEFAULT NULL,
    `favorite` tinyint(1) DEFAULT 0,
    `status` ENUM(
        'active',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `phone` (`phone`),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `citizenid_phone` (`citizenid`, `phone`),
    KEY `citizenid_fav` (
        `citizenid`,
        `favorite`,
        `status`
    ),
    CONSTRAINT `fk_contacts_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_messages_conversations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `is_group` tinyint(1) NOT NULL DEFAULT 0,
    `name` varchar(50) DEFAULT NULL,
    `status` ENUM(
        'active',
        'archived',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `citizenid_status_updated` (
        `citizenid`,
        `status`,
        `updated_at`
    ),
    KEY `updated_at` (`updated_at`),
    CONSTRAINT `fk_conversations_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_messages_participants` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `conversation_id` int(11) NOT NULL,
    `citizenid` varchar(50) NOT NULL,
    `role` varchar(20) NOT NULL DEFAULT 'member',
    `status` ENUM(
        'active',
        'left',
        'removed',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `last_read` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `left_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `conversation_participant` (
        `conversation_id`,
        `citizenid`
    ),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `conv_status` (`conversation_id`, `status`),
    KEY `participant_last_read` (`citizenid`, `last_read`),
    CONSTRAINT `fk_participants_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `gphone_messages_conversations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_participants_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_messages` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `conversation_id` int(11) NOT NULL,
    `citizenid` varchar(50) NOT NULL,
    `status` ENUM(
        'active',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `message` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `citizenid` (`citizenid`),
    KEY `status` (`status`),
    KEY `conv_status_created` (
        `conversation_id`,
        `status`,
        `created_at`
    ),
    CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `gphone_messages_conversations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_photos` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `image` MEDIUMTEXT NOT NULL,
    `status` ENUM(
        'active',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `citizenid_status_created` (
        `citizenid`,
        `status`,
        `created_at`
    ),
    CONSTRAINT `fk_photos_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_messages_attachments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `message_id` int(11) NOT NULL,
    `citizenid` varchar(50) NOT NULL,
    `photo_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `message_id` (`message_id`),
    KEY `citizenid` (`citizenid`),
    KEY `photo_id` (`photo_id`),
    CONSTRAINT `fk_attachments_message` FOREIGN KEY (`message_id`) REFERENCES `gphone_messages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attachments_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE,
    CONSTRAINT `fk_attachments_photo` FOREIGN KEY (`photo_id`) REFERENCES `gphone_photos` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_notes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `title` varchar(255) DEFAULT NULL,
    `content` text DEFAULT NULL,
    `status` ENUM(
        'active',
        'archived',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `citizenid_status_updated` (
        `citizenid`,
        `status`,
        `updated_at`
    ),
    CONSTRAINT `fk_notes_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_mail` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `sender` varchar(100) NOT NULL,
    `sender_address` varchar(100) DEFAULT NULL,
    `subject` varchar(255) NOT NULL,
    `content` text NOT NULL,
    `status` ENUM(
        'active',
        'archived',
        'deleted',
        'moderated'
    ) NOT NULL DEFAULT 'active',
    `read` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `status` (`status`),
    KEY `citizenid_status` (`citizenid`, `status`),
    KEY `citizenid_status_created` (
        `citizenid`,
        `status`,
        `created_at`
    ),
    KEY `citizenid_read_status` (`citizenid`, `read`, `status`),
    CONSTRAINT `fk_mail_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gphone_audit_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `citizenid` varchar(50) NOT NULL,
    `action` ENUM(
        'archived',
        'unarchived',
        'deleted',
        'left',
        'removed',
        'moderated'
    ) NOT NULL,
    `controller` varchar(100) NOT NULL,
    `method` varchar(100) NOT NULL,
    `target_id` int(11) NOT NULL,
    `target_table` varchar(100) DEFAULT NULL,
    `details` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `citizenid` (`citizenid`),
    KEY `action` (`action`),
    KEY `controller_method` (`controller`, `method`),
    KEY `target` (`target_table`, `target_id`),
    CONSTRAINT `fk_audit_logs_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players` (`citizenid`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;