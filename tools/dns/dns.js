// constants
const RECORD_TYPE = {
    A: 1,
    AAAA: 28,
    CAA: 257,
    CNAME: 5,
    MX: 15,
    NS: 2,
    PTR: 12,
    SOA: 6,
    SRV: 33,
    TXT: 16
};

const RECORD_NAMES = Object.fromEntries(Object.entries(RECORD_TYPE).map(x => [x[1], x[0]]));

// terrible timespan formatting code
const MINUTE = 60, HOUR = 60 * MINUTE, DAY = 24 * HOUR;
const addTime = (current, n, unit) => n > 0 ? `${current} ${n} ${n == 1 ? unit : unit + "s"}` : current;
const formatTTL = seconds => {
    let result = "";
    const days = Math.floor(seconds / DAY);
    seconds -= days * DAY;
    result = addTime(result, days, "day");
    const hours = Math.floor(seconds / HOUR);
    seconds -= hours * HOUR;
    result = addTime(result, hours, "hour");
    const minutes = Math.floor(seconds / MINUTE);
    seconds -= minutes * MINUTE;
    result = addTime(result, minutes, "minute");
    result = addTime(result, seconds, "second");
    return result.trim();
};

// i can't help but feel that i'm overengineering this
const SELF = x => x;
const FIELD = name => obj => obj[name];
const TTL = name => obj => formatTTL(obj[name]);

const RECORD_FORMAT = {
    [RECORD_TYPE.A]: {"IPv4 Address": SELF},
    [RECORD_TYPE.AAAA]: {"IPv6 Address": SELF},
    [RECORD_TYPE.CAA]: {
        "Tag": FIELD("tag"),
        "Value": FIELD("value"),
        "Flags": FIELD("flags")
    },
    [RECORD_TYPE.CNAME]: {"Canonical Name": SELF},
    [RECORD_TYPE.MX]: {
        "Exchange": FIELD("exchange"),
        "Preference": FIELD("preference")
    },
    [RECORD_TYPE.NS]: {"Nameserver": SELF},
    [RECORD_TYPE.PTR]: {"Domain Name": SELF},
    [RECORD_TYPE.SOA]: {
        "Master Nameserver": FIELD("mname"),
        "Admin Contact": FIELD("rname"),
        "Serial": FIELD("serial"),
        "Refresh": TTL("refresh"),
        "Retry": TTL("retry"),
        "Expire": TTL("expire"),
        "Minimum TTL": TTL("minimum")
    },
    [RECORD_TYPE.SRV]: {
        "Target": FIELD("target"),
        "Port": FIELD("port"),
        "Priority": FIELD("priority"),
        "Weight": FIELD("weight")
    },
    [RECORD_TYPE.TXT]: {"Value": rdata => rdata.join(" ")},
};

// inputs
const hostname = document.getElementById("hostname"),
      nameserver = document.getElementById("nameserver"),
      recordType = document.getElementById("record"),
      iterative = document.getElementById("iterative"),
      submit = document.getElementById("submit");

// outputs
const status = document.getElementById("status"),
      resultsBox = document.getElementById("results-box"),

// queries
const queries = document.getElementById("queries"),
      queryTemplate = document.getElementById("query");

// disable the nameserver field when querying from roots
iterative.addEventListener("input", () => nameserver.disabled = iterative.checked);

// create table for records of same type
const ELEMENT = (type, text) => {
    const element = document.createElement(type);
    element.textContent = text;
    return element;
};

const TH = text => ELEMENT("th", text);
const TD = text => ELEMENT("td", text);

const createRecordsTable = (records, type) => {

    const wrapper = document.createElement("div");
    wrapper.style.overflow = "auto";

    const table = document.createElement("table");
    const format = RECORD_FORMAT[type];

    // add headers
    const headerRow = document.createElement("tr");
    headerRow.append(TH("Domain"), ...Object.keys(format).map(TH), TH("TTL"));
    table.append(headerRow);

    // add records
    for(const record of records) {
        const row = document.createElement("tr");
        row.append(TD(record.domain), ...Object.values(format).map(func => TD(func(record.rdata))), TD(formatTTL(record.ttl)));
        table.append(row);
    }
    
    wrapper.append(table);
    return wrapper;

};

const STATUS = {
    0: "OK",
    1: "Bad Query",
    2: "Server Error",
    3: "No Such Domain",
    4: "Unsupported",
    5: "Refused"
};

const createQueryResult = (nameserver, response) => {
    
    const element = queryTemplate.content.cloneNode(true);
    element.querySelector(".query-nameserver").textContent = nameserver;
    element.querySelector(".query-latency").textContent = response.latency;

    const status = element.querySelector(".query-status");
    status.textContent = STATUS[response.responseCode] || "Unknown";
    status.style.color = response.responseCode == 0 ? "#60e060" : "#e06060";
    
    const authoritative = element.querySelector(".query-authoritative");
    authoritative.textContent = response.flags.authoritative ? "Yes" : "No";
    authoritative.style.color = response.authoritative ? "#ff8000" : "#e06060";

    element.querySelector(".query-num-records").textContent = response.records.length;
    
    // bin records by type
    const buckets = response.records.reduce((buckets, record) => {
        (buckets[record.type] || (buckets[record.type] = [])).push(record);
        return buckets;
    }, {});

    const query = element.querySelector(".query");
    for(const type in buckets) {
        const header = ELEMENT("h2", `${RECORD_NAMES[type]} records`);
        query.append(header, createRecordsTable(buckets[type], type));
    }

    return element;
};

const query = async (hostname, nameserver, type) => {
    try {
        const resp = await fetch(`https://apis.bithole.dev/dns-query?hostname=${hostname}&nameserver=${nameserver}&type=${type}`);
        if(resp.ok) return await resp.json();
    } catch(err) {
        return;
    }
};

const queryIteratively = () => {

};

const queryDirectly = async () => {
    
};

document.getElementById("form").addEventListener("submit", async (event) => {

    // freeze UI
    event.preventDefault();
    hostname.disabled = true;
    const nameserverStatus = nameserver.disabled;
    nameserver.disabled = true;
    record.disabled = true;
    submit.disabled = true;

    // reset stuff
    resultsBox.innerHTML = "";
    queries.innerHTML = "";
    status.innerHTML = "";

    const answers = iterative.checked ? queryIteratively() : queryDirectly;

    // update status and answers
    if(answers.length > 0) {
        status.textContent = `Retrieved ${answers.length} authoritative ${recordType.value} record(s) for the domain "${hostname.value}".`;
        resultsBox.append(createRecordsTable(answers, answers[0].type));
    } else {
        status.textContent = `Your query couldn't be answered.`;
    }

    // add log messages
    for(const message of dns.logs) {
        logBox.append(createLogMessage(message));
    }

    // restore UI
    nameserver.disabled = nameserverStatus;
    hostname.disabled = false;
    record.disabled = false;
    submit.disabled = false;

});
