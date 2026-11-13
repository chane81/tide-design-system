"use client";
import { createContext } from "react";
import type { DisclosureGroupState } from "react-stately";

export const AccordionContext = createContext<DisclosureGroupState | null>(null);
