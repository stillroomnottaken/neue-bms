<?php
defined('APP_ROOT') or exit;

/** Current published content: ['rev'=>int,'savedAt'=>int,'by'=>string,'data'=>array]. Creates it from the shipped seed on first run. */
function content_current(): array {
    $c = store_read('content');
    if (is_array($c) && isset($c['data'], $c['rev'])) return $c;
    return with_lock('content', function () {
        $c = store_read('content');
        if (is_array($c) && isset($c['data'], $c['rev'])) return $c;
        $seed = json_decode((string)file_get_contents(APP_ROOT . '/inc/seed.json'), true);
        $c = ['rev' => 1, 'savedAt' => time(), 'by' => 'setup', 'data' => clean_content($seed)];
        store_write('content', $c);
        return $c;
    });
}
/** Publish new content. Keeps the previous version in the history. Throws RuntimeException('conflict') when $baseRev is stale. */
function content_publish(array $clean, string $by, ?int $baseRev, string $note = ''): array {
    return with_lock('content', function () use ($clean, $by, $baseRev, $note) {
        $cur = content_current();
        if ($baseRev !== null && $baseRev !== (int)$cur['rev']) throw new RuntimeException('conflict');
        store_write('revisions/r' . (int)$cur['rev'], ['rev' => (int)$cur['rev'], 'savedAt' => $cur['savedAt'], 'by' => $cur['by'], 'note' => $cur['note'] ?? '', 'data' => $cur['data']]);
        $new = ['rev' => (int)$cur['rev'] + 1, 'savedAt' => time(), 'by' => $by, 'note' => $note, 'data' => $clean];
        store_write('content', $new);
        // keep only the newest N history entries
        $keep = (int)cfg('revisions_keep', 30);
        $revs = store_list('revisions');
        usort($revs, fn($a, $b) => (int)substr(basename($b), 1) <=> (int)substr(basename($a), 1));
        foreach (array_slice($revs, $keep) as $old) store_delete($old);
        return $new;
    });
}
function revisions_list(): array {
    $out = [];
    foreach (store_list('revisions') as $name) {
        $r = store_read($name);
        if (!is_array($r)) continue;
        $out[] = ['id' => 'r' . (int)$r['rev'], 'at' => (int)$r['savedAt'], 'by' => (string)($r['by'] ?? ''), 'note' => (string)($r['note'] ?? ''), 'bytes' => strlen(json_encode($r['data']))];
    }
    usort($out, fn($a, $b) => $b['at'] <=> $a['at']);
    return $out;
}
