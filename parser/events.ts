import moment, { Moment } from 'moment'

export class UnitInfo {
    public guid: string
    public name: string

    constructor(guid: string, name: string) {
        this.guid = guid
        this.name = name
    }

    isPlayer() {
        return this.guid.startsWith('Player')
    }
}

export class UnitReplace {
    public source: UnitInfo
    public target: UnitInfo

    constructor(source: UnitInfo, target: UnitInfo) {
        this.source = source
        this.target = target
    }

    replace(line: string) {
        return line
            .replace(this.source.guid, this.target.guid)
            .replace(`"${this.source.name}"`, `"${this.target.name}"`)
    }
}

export class CombatEvent {
    public datetime: Moment
    public event: string
    public params: string[]

    constructor(line: string) {
        const [date, time, eventAndParam] = line.trim().split(/\s+/)
        this.datetime = moment(`${date} ${time}`, 'M/D HH:mm:ss.SSS')
        const [event, ...params] = eventAndParam.split(',')
        this.event = event
        this.params = params
    }

    between(start: Moment = moment('2000-01-01'), end: Moment = moment()) {
        return start.isBefore(this.datetime) && end.isAfter(this.datetime)
    }

    toLine(offset: number, replaces: UnitReplace[] = []) {
        const dt = this.datetime.clone().add(offset, 'seconds')
        let line = `${dt.format('M/D HH:mm:ss.SSS')}  ${[this.event, ...this.params].join(',')}`
        for (const r of replaces) {
            line = r.replace(line)
        }
        return {
            datetime: dt,
            line: line
        }
    }
}


const nop = () => { }


const parsers = [
    {
        events: [
            'SPELL_AURA_APPLIED',
            'SPELL_AURA_REFRESH',
            'SPELL_AURA_REMOVED',
            'SPELL_CAST_SUCCESS',
            'SPELL_CAST_START',
            'SPELL_HEAL'
        ],
        parser: function spellPrefixEvent(combatEvent: CombatEvent) {
            const [sourceGUID, sourceName] = combatEvent.params
            const [targetGUID, targetName] = combatEvent.params.slice(4)
            return [new UnitInfo(sourceGUID, sourceName), new UnitInfo(targetGUID, targetName)]
        }
    }
]


const unitExtractors = (() => {
    const eh: { [key: string]: (combatEvent: CombatEvent) => UnitInfo[] } = {}
    for (const { events, parser } of parsers) {
        for (const event of events) {
            eh[event] = parser
        }
    }
    return eh
})()


export function extractPlayers(combatEvents: CombatEvent[]) {
    const map = new Map<string, UnitInfo>()
    for (const combatEvent of combatEvents) {
        const units = unitExtractors[combatEvent.event]?.(combatEvent) ?? []
        units.filter(u => u.isPlayer()).forEach(u => map.set(u.guid, u))
    }
    return [...map.values()]
}
