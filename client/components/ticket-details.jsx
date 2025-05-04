"use client"

import { Badge } from "@/components/ui/badge"
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react"

export const getStatusBadge = (status) => {
    switch (status) {
        case "PENDING":
            return (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                </Badge>
            )
        case "APPROVED":
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                </Badge>
            )
        case "REJECTED":
            return (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                </Badge>
            )
        default:
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    Unknown
                </Badge>
            )
    }
}

export const getTicketTitle = (ticket) => {
    switch (ticket.type) {
        case "GRADE_UPGRADE":
            return "Grade Upgrade Request"
        case "MACHINE_CREATION":
            return "Machine Creation Request"
        case "MACHINE_DELETION":
            return `Machine Deletion Request - ${ticket.machineId || "Unknown Machine"}`
        default:
            return "Unknown Request Type"
    }
}

export const getTicketDescription = (ticket) => {
    switch (ticket.type) {
        case "GRADE_UPGRADE":
            return (
                <p className="text-sm text-muted-foreground">
                    From <span className="font-medium">{ticket.currentGrade?.name}</span>{" "}
                    to <span className="font-medium">{ticket.targetGrade?.name}</span>
                </p>
            )
        case "MACHINE_CREATION":
            return (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Name: <span className="font-medium">{ticket.machineData?.name}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Main Pole: <span className="font-medium">{ticket.machineData?.mainPole}</span>
                    </p>
                </div>
            )
        case "MACHINE_DELETION":
            return (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Machine: <span className="font-medium">{ticket.machineId}</span>
                    </p>
                </div>
            )
        default:
            return <p className="text-sm text-muted-foreground">No additional details available</p>
    }
}

export const getDetailedContent = (ticket) => {
    switch (ticket.type) {
        case "GRADE_UPGRADE":
            return (
                <div className="space-y-2">
                    <h3 className="font-medium">Grade Information</h3>
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">
                            Current Grade: <span className="font-medium">{ticket.currentGrade?.name}</span>
                        </p>
                        <p className="text-sm">
                            Target Grade: <span className="font-medium">{ticket.targetGrade?.name}</span>
                        </p>
                    </div>
                </div>
            )
        case "MACHINE_CREATION":
            return (
                <div className="space-y-2">
                    <h3 className="font-medium">Machine Information</h3>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                        <p className="text-sm">
                            Name: <span className="font-medium">{ticket.machineData?.name}</span>
                        </p>
                        <p className="text-sm">
                            Main Pole: <span className="font-medium">{ticket.machineData?.mainPole}</span>
                        </p>
                        <p className="text-sm">
                            Sub Pole: <span className="font-medium">{ticket.machineData?.subPole}</span>
                        </p>
                        <p className="text-sm">
                            Points/Cycle: <span className="font-medium">{ticket.machineData?.pointsPerCycle}</span>
                        </p>
                        <p className="text-sm">
                            Max Users: <span className="font-medium">{ticket.machineData?.maxUsers}</span>
                        </p>
                        <p className="text-sm">
                            Required Grade: <span className="font-medium">{ticket.machineData?.requiredGrade}</span>
                        </p>
                    </div>
                </div>
            )
        case "MACHINE_DELETION":
            return (
                <div className="space-y-2">
                    <h3 className="font-medium">Machine Information</h3>
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">
                            ID: <span className="font-mono text-xs">{ticket.machineId}</span>
                        </p>
                    </div>
                </div>
            )
        default:
            return null
    }
}
