<?php
if (!$file)
    return;
$alt = $file->alt()->value() ?? '';
if ($file->extension() === 'svg'):
    $a11y = $alt === ''
        ? 'aria-hidden="true"'
        : 'role="img" aria-label="' . esc($alt, 'attr') . '"';
    echo preg_replace('/<svg\b/', '<svg ' . $a11y, svg($file), 1);
else:
    $sizes ??= '(max-width: 800px) 80vw, 45vw';
    $thumb = $file->resize(1200);
    ?>
    <img src="<?= $thumb->url() ?>" srcset="<?= $file->srcset([400, 800, 1200, 1800]) ?>" sizes="<?= $sizes ?>"
        width="<?= $thumb->width() ?>" height="<?= $thumb->height() ?>" alt="<?= esc($alt, 'attr') ?>" loading="lazy"
        decoding="async">
<?php endif ?>