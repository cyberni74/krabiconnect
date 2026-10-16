#!/bin/sh
# Cuts the generated 2k sheets (SRC) into trimmed sprites in OUT (density 4 = 4 stored px per logical unit).
# usage: tools/build-assets.sh SRC_DIR OUT_DIR
set -e
SRC=${1:-/tmp/claude-0/gen/r2}; OUT=${2:-/tmp/claude-0/gen/g2}
D="--density 4"
mkdir -p "$OUT/chars" "$OUT/props" "$OUT/items" "$OUT/bg"
S="python3 tools/sheet.py"
$S $SRC/bran_walk.png $OUT/chars bran_stand,bran_walk1,bran_walk2,bran_walk3 --ref 0 --refh 131 --canvas $D
$S $SRC/bran_actions.png $OUT/chars bran_pick,bran_use,bran_swing,bran_dig --ref 1 --refh 128 --canvas $D
npc(){ $S $SRC/npc_$1.png $OUT/chars $2 --ref ${4:-0} --refh $3 $D; }
npc brandt brandt_idle,brandt_talk,brandt_point 140
npc hilda hilda_idle,hilda_talk 118
npc gero gero_idle,gero_talk 135
npc anselm anselm_idle,anselm_talk,anselm_pray 138
npc oswin oswin_idle,oswin_talk 125
npc halvard halvard_idle,halvard_talk 100
npc morwenna morwenna_idle,morwenna_talk,morwenna_stir 142
npc grimm grimm_idle,grimm_talk 145
npc wache wache_idle,wache_alert 138
npc roderic roderic_idle,roderic_talk 148
npc pip pip_idle,pip_talk 95
npc berta berta_idle,berta_talk 135
npc myrddin myrddin_idle,myrddin_talk,myrddin_cast 150
npc aldemar aldemar_idle,aldemar_talk 130
npc malvor malvor_idle,malvor_talk,malvor_cast 146
npc aldric aldric_idle,aldric_talk 138
npc knorr knorr_idle,knorr_sleep 130
npc skelett skelett_still,skelett_wach 150
npc wolf wolf_growl,wolf_flee 62
npc katze katze_sit,katze_stretch 40
npc pferd pferd_idle,pferd_stamp 150
npc rabe rabe_idle,rabe_caw,rabe_flap 36
npc drache drache_sleep,drache_wach,drache_roar 320 1
prop(){ $S $SRC/prop_$1.png $OUT/props $2 --rows ${4:-2} --heights $3 $5 $D; }
prop p01 brunnen,brunnen_seil,leichenkarren,galgen,galgen_leer,anschlagbrett 120,120,80,210,210,110
prop p02 pechfass,pechfass_leer,kiste_dorf,kiste_dorf_offen,heuhaufen,schubkarre 70,70,55,70,80,55
prop p03 esse_kalt,esse_kohle,esse_feuer,esse_glut,amboss,loeschfass 125,125,125,125,70,65 2 "--dil 3"
prop p04 blasebalg_kaputt,blasebalg_heil,schleifstein,kohlekiste,kohlekiste_offen,kohlesack 70,70,85,55,65,50
prop p05 werkzeugschrank_zu,werkzeugschrank_s1,werkzeugschrank_s2,werkzeugschrank_s3 170,170,170,170 1
prop p06 altar,weihwasser_leer,weihwasser_voll,opferstock,pult_bibel,kerzenstaender 100,100,100,85,110,120 2 "--dil 2"
prop p07 sakristei_zu,sakristei_s_unten,sakristei_s_oben,sakristei_fach 170,170,170,170 1
prop p08 knopf_rabe,knopf_lamm,knopf_kreuz,falltuer_zu,falltuer_offen,beichtstuhl 36,36,36,50,60,170 2 "--dil 2"
prop p09 sarkophag,sarkophag_offen,reliquienschrein_zu,reliquienschrein_offen,sargdeckel,knochenhaufen 80,80,120,120,120,40 2 "--dil 4"
prop p10 falle_offen,falle_zu,baumstumpf,pilze,tierskelett,fackelhalter 24,24,60,34,55,60 2 "--dil 4"
prop p11 moorlaterne_aus,moorlaterne_an,totem,alraune,grabloch,schlange 130,130,170,40,24,36 2 "--dil 3"
prop p12 kessel_kalt,kessel_kocht,kessel_gegengift,besen,kaefig_rabe,spiegel_verhuellt 90,95,95,140,85,160 2 "--dil 1"
prop q01 fallgitter_unten,fallgitter_oben,torwinde,schluesselbrett,regentonne,steinhaufen 200,70,90,70,60,36 2 "--dil 3"
prop q02 uebungspuppe,waffenstaender,futtertrog,heukarren,suppenkessel,brunnen_burg 110,100,40,90,85,110 2 "--dil 3"
prop q03 ruestungsstaender_leer,ruestungsstaender_brust,ruestungsstaender_helm,ruestungsstaender_voll,truhe_waffe_zu,truhe_waffe_offen 150,150,150,150,60,75 2 "--dil 3"
prop q04 kommode_wk_zu,kommode_wk_oben,kommode_wk_unten,werkbank,sandkiste,lumpenkorb 110,110,110,70,36,36 2 "--dil 3"
prop q05 tisch_bib,buch_rot,buch_gruen,buch_blau,buch_schwarz,globus 70,34,34,34,34,110 2 "--dil 3"
prop q06 waage_neutral,waage_links,waage_rechts,geheimtuer_zu,geheimtuer_offen,sessel 110,110,110,170,170,90 2 "--dil 3"
prop q07 geheimfach_zu,geheimfach_offen,tischchen_kelch,weihrauchfass,fahnenstaender,wappenschild 70,70,80,80,150,60 2 "--dil 3"
prop q08 zelle_offen,wachtisch,schluesselhaken,weinfass,strohlager,ketten_wand 160,70,60,70,30,100 2 "--dil 3"
prop q09 felsbrocken,lavastrom,lavastrom_erstarrt,ritterskelett,dampfschlot,obsidian 120,140,140,70,40,60 2 "--dil 3 --thr 150"
prop q10 altar_ei_leer,altar_ei_ei,goldhaufen,knochenpfahl,altruestung,horn_liegend 75,75,40,100,50,36 2 "--dil 3"
item(){ $S $SRC/item_$1.png $OUT/items $2 --rows 3 --heights $3 --dil ${4:-8} $D; }
item i1 schaufel,silber,stiefel_alt,nadel_zwirn,feuerstein,holzstab,pech,flasche_leer,weihwasser,gruftschluessel,reliquie,klingenbruch 46,34,40,34,34,40,32,44,44,40,40,40
item i2 kohle,hammer,schwert,eimer_wasser,wurst,siegelring,halvard_brief,rabenfeder,kerzenwachs,alraune,schlangenzunge,moorwasser 36,44,48,44,36,28,36,36,30,42,40,42
item i3 gegengift,hexentalisman,fieberkraut,lappen,sand,wein,schlafkraut,zellenschluessel,helm,brustpanzer,armschienen,schild 42,40,40,32,38,42,40,42,44,46,40,46
item i4 spiegelschild,weisheitssiegel,giftflasche,drachenei,horn,kohlekiste_schluessel,kreide,weihrauch,eisenstange,kerze,hildas_brosche,apfel 46,34,40,44,40,28,26,32,50,42,24,30 4
item d1 zinnbecher,holzloeffel,nagel,tonscherbe,zahn,kamm,rosenkranz,pergamentfetzen,haarlocke,pilz,kreuzanhaenger,spielfigur 28,34,22,26,22,24,32,28,26,28,30,32
item d2 gaensefeder,rattenfalle,messingknopf,glasauge,rabenkralle,apfelrest,knochen,wuerfel,tote_ratte,zinnring,schnalle,spindel 34,26,20,22,26,22,34,22,24,18,24,34
item test eisenschluessel,eimer,seil,hufeisen,trank_rot,fackel,siegelbrief,muenzbeutel,totenkopf,kerzenstummel,rostiger_dolch,brot_alt 36,44,40,36,40,50,36,36,36,34,44,26
python3 - "$SRC" "$OUT" <<'PY'
import sys, glob, os
from PIL import Image
src, out = sys.argv[1:3]
for f in sorted(glob.glob(f"{src}/bg_*.png")):
    n = os.path.basename(f)[3:-4]
    im = Image.open(f).convert("RGB"); w, h = im.size
    cw = round(h * 960 / 440); x0 = (w - cw) // 2
    im.crop((x0, 0, x0 + cw, h)).save(f"{out}/bg/{n}.webp", quality=82, method=6)
Image.open(f"{src}/title.png").convert("RGB").save(f"{out}/title.webp", quality=84, method=6)
print("bg ok")
PY
