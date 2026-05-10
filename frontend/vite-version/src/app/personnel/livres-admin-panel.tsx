"use client"

import * as React from "react"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createBook,
  deleteBook,
  fetchBooksPage,
  getLivresApiBaseUrl,
  updateBook,
  type BookPayload,
} from "@/lib/api/livres"
import type { Book } from "@/types/book"
import { toast } from "sonner"

const emptyPayload = (): BookPayload => ({
  titre: "",
  auteur: "",
  categorie: "",
  isbn: "",
})

export function LivresAdminPanel() {
  const configured = Boolean(getLivresApiBaseUrl())
  const [items, setItems] = React.useState<Book[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Book | null>(null)
  const [payload, setPayload] = React.useState<BookPayload>(emptyPayload)

  const reload = React.useCallback(async () => {
    if (!configured) return
    setLoading(true)
    try {
      const res = await fetchBooksPage({ page: 1, pageSize: 200, q: undefined })
      setItems(res.items)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [configured])

  React.useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditing(null)
    setPayload(emptyPayload())
    setOpen(true)
  }

  function openEdit(b: Book) {
    setEditing(b)
    setPayload({
      titre: b.titre,
      auteur: b.auteur,
      categorie: b.categorie,
      isbn: b.isbn,
    })
    setOpen(true)
  }

  async function submit() {
    if (!payload.titre.trim() || !payload.auteur.trim()) {
      toast.error("Titre et auteur sont obligatoires.")
      return
    }
    try {
      if (editing) {
        const updated = await updateBook(editing.id, payload)
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        toast.success("Livre mis à jour.")
      } else {
        const created = await createBook(payload)
        setItems((prev) => [created, ...prev])
        toast.success("Livre ajouté.")
      }
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Supprimer ce livre ?")) return
    try {
      await deleteBook(id)
      setItems((prev) => prev.filter((b) => b.id !== id))
      toast.success("Livre supprimé.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    }
  }

  if (!configured) {
    return (
      <p className="text-muted-foreground rounded-md border bg-muted/40 px-4 py-3 text-sm">
        Définissez <code className="rounded bg-muted px-1">VITE_API_LIVRES_URL</code> dans le fichier
        dédié puis relancez Vite pour gérer le fonds depuis cette page.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Gestion du fonds documentaire</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void reload()} disabled={loading}>
            Rafraîchir
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => {
              openCreate()
            }}
          >
            <Plus className="size-4 mr-2" aria-hidden />
            Ajouter un livre
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le livre" : "Nouveau livre"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    value={payload.titre}
                    onChange={(e) => setPayload((p) => ({ ...p, titre: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="auteur">Auteur</Label>
                  <Input
                    id="auteur"
                    value={payload.auteur}
                    onChange={(e) => setPayload((p) => ({ ...p, auteur: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input
                    id="categorie"
                    value={payload.categorie}
                    onChange={(e) => setPayload((p) => ({ ...p, categorie: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={payload.isbn}
                    onChange={(e) => setPayload((p) => ({ ...p, isbn: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="button" onClick={() => void submit()}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="size-6 animate-spin" />
          Chargement…
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">ID</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun livre. Ajoutez un ouvrage ou exécutez le script seed côté base.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-muted-foreground">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.titre}</TableCell>
                    <TableCell>{b.auteur}</TableCell>
                    <TableCell>{b.categorie}</TableCell>
                    <TableCell className="font-mono text-sm">{b.isbn || "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(b)}
                        aria-label={`Modifier ${b.titre}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => void remove(b.id)}
                        aria-label={`Supprimer ${b.titre}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
