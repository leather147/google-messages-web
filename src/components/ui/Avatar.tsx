"use client";

import Image from "next/image";

interface AvatarProps {
  name: string;
  initials: string;
  avatarColor: string;
  avatar: string | null;
  size?: number;
  isGroup?: boolean;
}

export function Avatar({
  name,
  initials,
  avatarColor,
  avatar,
  size = 48,
  isGroup = false,
}: AvatarProps) {
  const fontSize = size <= 32 ? 12 : size <= 40 ? 14 : size <= 48 ? 16 : 20;

  if (avatar) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 rounded-full flex items-center justify-center select-none"
      style={{
        width: size,
        height: size,
        background: avatarColor,
      }}
      aria-label={name}
    >
      {isGroup && (
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: fontSize + 4 }}
          aria-hidden="true"
        >
          group
        </span>
      )}
      {!isGroup && (
        <span
          className="font-medium text-white leading-none"
          style={{ fontSize }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
