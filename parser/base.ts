import fs from 'fs'
import moment, { Moment } from 'moment'

import { CombatEvent, UnitReplace, extractPlayers } from './events'

interface LogOption {
    path: string,
    start?: Moment,
    end?: Moment
}

interface ReplaceOption {
    offset?: number,
    replaces?: UnitReplace[]
}


function parseFileToEvents({ path, start, end }: LogOption) {
    const events: CombatEvent[] = []
    const file = fs.readFileSync(path, { encoding: 'utf-8' })
    for (let line of file.split('\r\n')) {
        line = line && line.trim()
        if (!line) {
            continue
        }
        const ce = new CombatEvent(line)
        if (ce.between(start, end)) {
            events.push(ce)
        }
    }
    return events
}



const fromEvents = {
    immediate: (events: CombatEvent[], { offset, replaces }: ReplaceOption, writeTo: string) => {
        const lines = events.map(e => e.toLine(offset, replaces).line)
        fs.appendFileSync(writeTo, lines.join('\r\n') + '\r\n')
    },
    sync: async (events: CombatEvent[], { replaces }: ReplaceOption, writeTo: string, flushInterval = 30) => {
        if (!events || events.length == 0) {
            return
        }
        const now = moment()
        const offset = now.diff(events[0].datetime, 'seconds')
        let replaced = events.map(e => e.toLine(offset, replaces))

        const outputStream = fs.createWriteStream(writeTo, { flags: 'a' })
        try {
            while (replaced.length > 0) {
                now.add(flushInterval, 'seconds')
                const content = []
                let i = 0
                for (; i < replaced.length && replaced[i].datetime.isBefore(now); i++) {
                    content.push(replaced[i].line)
                }
                outputStream.write(content.join('\r\n') + '\r\n')
                replaced = replaced.slice(i)
                if (replaced.length <= 0) {
                    break
                }
                await new Promise(res => setTimeout(res, flushInterval * 1000))
            }
        } catch (err) {
            console.log(err)
        } finally {
            outputStream.close()
        }
    }
}

const fromLog = {
    immediate: (logOption: LogOption, replaceOption: ReplaceOption, writeTo: string) => {
        const events = parseFileToEvents(logOption)
        return fromEvents.immediate(events, replaceOption, writeTo)
    },
    sync: async (logOption: LogOption, replaceOption: ReplaceOption, writeTo: string, flushInterval = 30) => {
        const events = parseFileToEvents(logOption)
        if (!events) {
            return
        }
        return fromEvents.sync(events, replaceOption, writeTo, flushInterval)
    }
}


export const replay = {
    fromEvents: fromEvents,
    fromLog: fromLog
}

export function parseLog(logOption: LogOption) {
    return extractPlayers(parseFileToEvents(logOption))
}
